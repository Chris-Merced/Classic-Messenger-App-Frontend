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
  const [isBlocked, setIsBlocked] = useState("");
  const mainChatRef = useRef(null);

  const context = useContext(UserContext);
  const socketRef = useContext(WebsocketContext);
  const userData = context.user;
  const chatContext = useContext(UserChatsContext);
  const { currentChat } = chatContext;

  useEffect(() => {
    setUser(userData);
  }, [userData]);

  useEffect(() => {
    setChat({ ...currentChat });
  }, [currentChat]);

  useEffect(()=>{
    if(mainChatRef.current){
      mainChatRef.current.scrollTop = mainChatRef.current.scrollHeight;
    }
  },[messages])

  useEffect(() => {
    const setupMessageHandler = () => {
      console.log("Setting up message handler");
      socketRef.current.onmessage = (message) => {
        console.log("Message received in handler (before any processing)");
        message = JSON.parse(message.data);
        console.log("Message parsed:", message);
        console.log(chat);
        const dateObj = new Date(message.time);
        message = {
          ...message,
          time: new Date(message.time).toLocaleString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
          dateObj,
        };

        if (message.conversationID === chat.conversationID) {
          setMessages((prevMessages) => [...prevMessages, message]);
        }

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
  }, [chat, socketRef.current]);



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
          const dateObj = new Date(message.time);
          return {
            ...message,
            time: new Date(message.time).toLocaleString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }),
            dateObj,
          };
        });

        setMessages(timeFormattedArray);
      }
    };


    const checkIfBlocked = async () =>{
      if(!chat.name){
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/conversations/isBlocked?reciever=${chat.reciever[0]}&userID=${user.id}`) 
        const data = await response.json();
        setIsBlocked(data);
      }
    }

    getMessages();
    checkIfBlocked();

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
    <div className="mainContent">
    <div className="mainChat scroll-container" ref={mainChatRef}>
      <ul className="MessageList">
        {messages.map((message, index) => (
          <li className="message" key={index}>
            {index === 0 && (
              <div className="date">
                {messages[index].dateObj.toLocaleString("en-us", {
                  month: "short",
                  day: "2-digit",
                  year: "numeric",
                })}
              </div>
            )}
            {index > 0 &&
              messages[index].dateObj.toDateString() !==
                messages[index - 1].dateObj.toDateString() && (
                <div className="date">
                  {messages[index].dateObj.toLocaleString("en-us", {
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                  })}
                </div>
              )}
            <div className="messageHeader">
              {index === 0 && <div className="username">{message.user}</div>}
              {index > 0 &&
                (messages[index].user !== messages[index - 1].user ||
                  messages[index].dateObj.toDateString() !==
                    messages[index - 1].dateObj.toDateString()) && (
                  <div className="username">{message.user}</div>
                )}
              {index === 0 && <div>{messages[index].time}</div>}
              {index > 0 &&
                (new Date(messages[index].dateObj).getTime() -
                  new Date(messages[index - 1].dateObj).getTime() >=
                  5 * 60 * 1000 ||
                  messages[index].user !== messages[index - 1].user) && (
                  <div className="timeElapsed">{messages[index].time}</div>
                )}
            </div>
            <div className="messageText">{message.message}</div>
          </li>
        ))}
      </ul>
      
    </div>
    {user && (
        <div className="sendMessage">
          
          {isBlocked ? <div>You've been Blocked by this user</div> :
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
          </form>}
        </div>
      )}
      </div>
  );
};
export default HomeChatComponent;
