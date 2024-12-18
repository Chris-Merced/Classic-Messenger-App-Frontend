import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { UserContext } from '../context/userContext';
import { WebsocketContext } from '../context/websocketContext';

//Clean up user profile search functionality

const WebSocketComponent = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState('');
  const [conversationName, setConversationName] = useState('');
  const [chatName, setChatName] = useState('main');

  const context = useContext(UserContext);
  const socketRef = useContext(WebsocketContext);
  const userData = context.user;

  useEffect(() => {
    setUser(userData);
  }, [userData]);

  useEffect(() => {
    socketRef.current.onopen = () => {
      console.log('Connection Open');
    };

    socketRef.current.onmessage = (message) => {
      
      //THIS WILL NEED TO BE WRAPPED IN AN IF STATEMENT FOR MESSAGE TYPE: MAIN CHAT
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
      if (message.conversationName === 'main') {
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
        `${process.env.REACT_APP_BACKEND_URL}/messages/byChatName?chatName=${chatName}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      const data = await response.json();
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
    };
    getMessages();
  }, [chatName]);

  const sendMessage = (e) => {
    e.preventDefault();
    console.log(user);
    const data = {
      message: message,
      conversationName: conversationName,
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
    <>
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
                setConversationName('main');
              }}
              value={message}
            ></input>
            <button onClick={sendMessage}>Send Message</button>
          </form>
        </>
      )}
    </>
  );
};
export default WebSocketComponent;
