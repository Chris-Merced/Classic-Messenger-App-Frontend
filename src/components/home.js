import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useContext } from 'react';
import { UserContext } from '../context/userContext';
import { WebsocketContext } from '../context/websocketContext';
import { UserChatsContext } from '../context/chatListContext';
//Clean up user profile search functionality

const HomeChatComponent = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState('');
  const [conversationName, setConversationName] = useState('');
  const [chat, setChat] = useState({ name: 'main', conversationID: '' });

  const context = useContext(UserContext);
  const socketRef = useContext(WebsocketContext);
  const userData = context.user;
  const chatContext = useContext(UserChatsContext);
  const { currentChat } = chatContext;

  useEffect(() => {
    setUser(userData);
  }, [userData]);

  useEffect(() => {
    setChat(currentChat);
  }, [currentChat]);

  useEffect(() => {
    socketRef.current.onopen = () => {
      console.log('Connection Open');
    };

    socketRef.current.onmessage = (message) => {
      message = JSON.parse(message.data);
      console.log(message);
      message = {
        ...message,
        time: new Date(message.time).toLocaleString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
      };
      console.log(message);
      if (message.conversationName === chat.name) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
      console.log(messages);
    };

    socketRef.current.onclose = () => {
      console.log('connection closed');
    };

    socketRef.current.onerror = (error) => {
      console.error('WebSocket Error:', error);
    };

    return () => {
      socketRef.current.close();
    };
  }, []);

  useEffect(() => {
    const getMessages = async () => {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/messages/byChatName?chatName=${chat.name}&conversationID=${chat.conversationID}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        }
      );
      const data = await response.json();
      if (data.messages) {
        const timeFormattedArray = data.messages.map((message) => {
          return {
            ...message,
            time: new Date(message.time).toLocaleString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            }),
          };
        });

        setMessages(timeFormattedArray);
      }
    };
    getMessages();
  }, [chat]);

  const sendMessage = (e) => {
    e.preventDefault();
    const data = {
      message: message,
      conversationName: conversationName,
      conversationID: chat.conversationID,
      user: user.username,
      userID: user.id,
      time: new Date().toISOString(),
    };
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(data));
      setMessage('');
    } else {
      console.log('console is not open');
    }
  };

  return (
    <div className="mainChat">
      <ul className="MessageList">
        {messages.map((message, index) => (
          <li className="message" key={index}>
            <div className="time">{message.time}</div>
            <div className="username">{message.user}: </div>
            <div>{message.message}</div>
          </li>
        ))}
      </ul>
      {user && (
        <>
          <form>
            <input
              type="text"
              onChange={(e) => {
                setMessage(e.target.value);
                setConversationName(chat);
              }}
              value={message}
            ></input>
            <button onClick={sendMessage}>Send Message</button>
          </form>
        </>
      )}
    </div>
  );
};
export default HomeChatComponent;
