import React from "react";
import { useState, useEffect, useRef } from "react";
import { useContext } from "react";
import { UserContext } from "../context/userContext";
import { WebsocketContext } from "../context/websocketContext";
import { UserChatsContext } from "../context/chatListContext";

const HomeChatComponent = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState("");
  const [conversationName, setConversationName] = useState("");
  const [chat, setChat] = useState({ name: "main", conversationID: 1 });

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
    console.log(chat.name);
  }, [currentChat]);

  useEffect(() => {
    const setupMessageHandler = () => {
      console.log("Setting up message handler");
      socketRef.current.onmessage = (message) => {
        console.log("Message received in handler (before any processing)");
        message = JSON.parse(message.data);
        console.log("Message parsed:", message);
        console.log(chat);
        message = {
          ...message,
          time: new Date(message.time).toLocaleString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
        };

        //CHANGE TO IF CONVERSATIONNAME AND CHAT NAME THEN CHECK EACH OTHER
        if (message.conversationName === chat.name) {
          setMessages((prevMessages) => [...prevMessages, message]);
        }
        //OTHERWISE MAKE SURE THAT CONVERSATION NAME AND CHAT NAME ARE THE SAME PERSON VIA CONVERSATION ID
      };
    };

    if (socketRef.current) {
      if (socketRef.current.readyState === WebSocket.OPEN) {
        setupMessageHandler();
      }

      const originalOnOpen = socketRef.current.onopen;
      socketRef.current.onopen = () => {
        if (originalOnOpen) originalOnOpen();
        setupMessageHandler();
      };

      return () => {
        if (socketRef.current) {
          socketRef.current.onmessage = null;
        }
      };
    }
  }, [chat.name, socketRef.current]);

  useEffect(() => {
    const getMessages = async () => {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/messages/byChatName?chatName=${
          chat.name
        }&conversationID=${chat.conversationID}&userID=${user ? user.id : ""}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      const data = await response.json();
      if (data.messages) {
        const timeFormattedArray = data.messages.map((message) => {
          return {
            ...message,
            time: new Date(message.time).toLocaleString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }),
          };
        });

        setMessages(timeFormattedArray);
      }
    };
    getMessages();
  }, [chat]);

  const sendMessage = async (e) => {
    e.preventDefault();
    const data = {
      message: message,
      registration: false,
      conversationName: conversationName,
      conversationID: chat.conversationID,
      user: user.username,
      userID: user.id,
      reciever: chat.reciever ? [...chat.reciever, user.username] : undefined,
      time: new Date().toISOString(),
    };
    console.log("Made it inside send message");

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      console.log("made it inside to send message");
      socketRef.current.send(JSON.stringify(data));
      setMessage("");
    } else {
      console.log("console is not open");
    }

    const response = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}/conversations/messageToConversation`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      }
    );
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
                setConversationName(chat.name);
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
