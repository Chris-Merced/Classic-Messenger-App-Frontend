import React from "react";
import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../context/userContext";
import { WebsocketContext } from "../context/websocketContext";
import { UserChatsContext } from "../context/chatListContext";
import { v4 as uuidv4 } from 'uuid';


const HomeChatComponent = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState("");
  const [conversationName, setConversationName] = useState("");
  const [chat, setChat] = useState();
  const [isBlocked, setIsBlocked] = useState("");
  const [profileID, setProfileID] = useState("");
  const [incomingMessage, setIncomingMessage] = useState(false);
  const mainChatRef = useRef(null);
  const inputRef = useRef(null);
  const spanRef = useRef(null);
  const pageRef = useRef(0);
  const scrollBottomRef = useRef(true);
  const previousHeightRef = useRef(0);
  const abortMessageControllerRef = useRef(null);
  const abortBlockedControllerRef = useRef(null);
  const abortIsReadControllerRef = useRef(null);
  const initChatLoadRef = useRef(false);

  const context = useContext(UserContext);
  const socketRef = useContext(WebsocketContext);
  const userData = context.user;
  const chatContext = useContext(UserChatsContext);
  const { currentChat } = chatContext;

  useEffect(() => {
    const container = mainChatRef.current;
    if (!container) return;
    pageRef.current = 0;
    setMessages([]);
    scrollBottomRef.current = true;
    const handleScroll = async () => {
      scrollBottomRef.current = false;
      previousHeightRef.current = mainChatRef.current.scrollHeight;
      if (container.scrollTop === 0 && initChatLoadRef.current) {
        pageRef.current += 1;
        getMessages();
      }
      if (container.scrollTop === 0) {
        initChatLoadRef.current = true;
      }
    };
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [chat]);

  useLayoutEffect(() => {
    const container = mainChatRef.current;
    if (!container || pageRef.current === 0) return;
    const newHeight = container.scrollHeight;
    const heightDifference = newHeight - previousHeightRef.current;
    container.scrollTop = heightDifference;
  }, [messages]);

  useEffect(() => {
    const container = mainChatRef.current;
    if (container && incomingMessage) {
      container.scrollTop = container.scrollHeight;
      setIncomingMessage(false);
    }
  }, [messages]);

  useEffect(() => {
    if (context?.user?.id) {
      setUser(userData);
    }
  }, [context?.user]);

  useEffect(() => {
    setChat({ ...currentChat });
    initChatLoadRef.current = false;
  }, [currentChat]);

  useEffect(() => {
    if (mainChatRef.current && pageRef.current === 0) {
      setTimeout(() => {
        mainChatRef.current.scrollTop = mainChatRef.current.scrollHeight;
      }, 50);
    }
  }, [messages, chat]);

  useEffect(() => {
    if (spanRef.current && inputRef.current) {
      const width = spanRef.current.offsetWidth;
      inputRef.current.style.width = `${width + 20}px`;
    }
  }, [message]);

  useEffect(() => {
    const setupMessageHandler = async () => {
      if (socketRef.current) {
        socketRef.current.onmessage = null;
      }

      socketRef.current.onmessage = async (message) => {
        try {
          console.log(message.data);
          setIncomingMessage(true);
          message = JSON.parse(message.data);
          if (message.type === "message") {

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
              mainChatRef.current.scrollTop =
                mainChatRef.current.scrollHeight + 100;

              if (
                message.conversationID != 1 &&
                context.user.username !== message.user
              ) {
                const data = {
                  conversationID: message.conversationID,
                  senderID: message.userID,
                };

                const response = await fetch(
                  `${process.env.REACT_APP_BACKEND_URL}/conversations/isRead`,
                  {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                    credentials: "include",
                  }
                );

                console.log(response.ok);
              }
            } else if (
              message.conversationID !== chat.conversationID &&
              message.conversationID != 1
            ) {
              let modifiedChatList = chatContext.chatList;

              for (let i = 0; i < modifiedChatList.userChats.length; i++) {
                if (
                  modifiedChatList.userChats[i].conversation_id ===
                  message.conversationID
                ) {
                  modifiedChatList.userChats[i].is_read = false;
                }
              }
              chatContext.changeChatList({
                ...chatContext.chatList,
                userChats: [...modifiedChatList.userChats],
              });
            }

            let modifiedChatList = chatContext.chatList;

            for (let i = 0; i < modifiedChatList.userChats.length; i++) {
              if (
                modifiedChatList.userChats[i].conversation_id ===
                  message.conversationID &&
                message.conversationID !== 1
              ) {
                const tempItem = modifiedChatList.userChats.splice(i, 1)[0];
                modifiedChatList.userChats.splice(1, 0, tempItem);
                chatContext.changeChatList({
                  ...chatContext.chatList,
                  userChats: [...modifiedChatList.userChats],
                });
              }
            }
          } else if (message.type === "friendRequest") {
            context.addFriendRequest({
              id: parseInt(message.requestID),
              username: message.user,
            });
          }
        } catch (err) {
          console.log("Error handling websocket message: \n" + err.message);
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

  const getMessages = async () => {
    try {
      if (abortMessageControllerRef.current !== null) {
        abortMessageControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortMessageControllerRef.current = controller;
      const signal = controller.signal;

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/messages/byChatName?chatName=${
          chat.name
        }&conversationID=${chat.conversationID}&userID=${
          user ? user.id : ""
        }&page=${pageRef.current}&limit=20`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          signal,
        }
      );

      const data = await response.json();

      if (response.ok && data.messages) {
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

        if (data.recieverID) {
          setProfileID(data.recieverID);
        } else {
          setProfileID("");
        }

        setMessages((prev) => [...timeFormattedArray, ...prev]);

        if (chat.conversationID !== 1) {
          if (abortIsReadControllerRef.current !== null) {
            abortIsReadControllerRef.current.abort();
          }

          const abortIsReadController = new AbortController();
          abortIsReadControllerRef.current = abortIsReadController;
          const signal = abortIsReadController.signal;

          const isReadData = {
            conversationID: chat.conversationID,
            senderID: data.recieverID,
          };
          

          const response = await fetch(
            `${process.env.REACT_APP_BACKEND_URL}/conversations/isRead`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(isReadData),
              credentials: "include",
              signal,
            }
          );
         
        }

        if (!mainChatRef.current) {
          return null;
        } else {
          return true;
        }
      }
    } catch (err) {
      if (err.name === "AbortError") {
        console.log("Fetch Aborted");
      } else {
        console.error("Error getting chat message: \n" + err.message);
      }
    }
  };

  useEffect(() => {
    if (!chat || !chat.conversationID) return;
    try {
      if (abortBlockedControllerRef.current !== null) {
        abortBlockedControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortBlockedControllerRef.current = controller;
      const signal = controller.signal;

      const checkIfBlocked = async () => {
        if (!chat.name) {
          const response = await fetch(
            `${process.env.REACT_APP_BACKEND_URL}/conversations/isBlocked?reciever=${chat.reciever[0]}&userID=${user.id}`,
            { signal }
          );
          const data = await response.json();
          setIsBlocked(data);
        }
      };

      getMessages();
      checkIfBlocked();
    } catch (err) {
      if (err.name === "AbortError") {
        console.log("Fetch Aborted");
      } else {
        console.log(
          "Error while checking if user is blocked within chat window: \n" +
            err.message
        );
      }
    }
  }, [chat]);

  const sendMessage = async (e) => {
    e.preventDefault();
    try {
      const data = {    
        type: "message",
        message: message,
        registration: false,
        conversationName: conversationName,
        conversationID: chat.conversationID,
        user: user.username,
        userID: user.id,
        reciever: chat.reciever ? [...chat.reciever, user.username] : undefined,
        time: new Date().toISOString(),
      };

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/conversations/messageToConversation`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(data),
        }
      );

      if (response.ok) {
        if (
          socketRef.current &&
          socketRef.current.readyState === WebSocket.OPEN
        ) {
          console.log("made it inside to send message");
          socketRef.current.send(JSON.stringify(data));
          setMessage("");
          if (inputRef.current) {
            inputRef.current.style.height = "auto";
          }
          if (messages.length===0){
            chatContext.getChats();
          }
        } else {
          console.log("console is not open");
        }
      }
    } catch (err) {
      console.log("Error sending message: \n" + err.message);
    }
  };

  const deleteMessage = async (messageID) => {
    try {
      const data = {
        id: context.user.id,
        messageID: messageID,
      };
      console.log(messageID)
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/admin/message`,
        {
          method: "DELETE",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      
      if (response.ok) {
        console.log("Message deleted");
        setMessages((prev) => prev.filter((msg) => msg.id !== messageID));
      } else {
        console.log("Message could not be deleted");
      }
    } catch (err) {
      console.error("Error deleting message from database" + err.message);
    }
  };


  return (
    <div
      className="mainContent fadeInStaggered--1"
      role="main"
      aria-label="Chat interface"
    >
      {user && (
        <>
          {currentChat &&
            (profileID ? (
              <Link
                className="conversationHeader"
                to={`/userProfile/${profileID}`}
              >
                <img
                  className="currentChatImage"
                  src={currentChat.pictureURL}
                ></img>

                <h1 role="heading" aria-level="1">
                  {currentChat.name
                    ? currentChat.name
                    : currentChat.reciever[0]}
                </h1>
              </Link>
            ) : (
              <h1 role="heading" aria-level="1">
                {currentChat.name ? currentChat.name : currentChat.reciever[0]}
              </h1>
            ))}
          <div
            className="mainChat scroll-container"
            ref={mainChatRef}
            role="log"
            aria-live="polite"
            aria-label="Message log"
          >
            <ul className="MessageList" role="list">
              {messages.map((message, index) => (
                <li className="message" key={message.id || uuidv4()} role="listitem">
                  {index === 0 && (
                    <div
                      className="date"
                      role="separator"
                      aria-label={messages[index].dateObj.toLocaleString(
                        "en-us",
                        {
                          month: "short",
                          day: "2-digit",
                          year: "numeric",
                        }
                      )}
                    >
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
                      <div
                        className="date"
                        role="separator"
                        aria-label={messages[index].dateObj.toLocaleString(
                          "en-us",
                          {
                            month: "short",
                            day: "2-digit",
                            year: "numeric",
                          }
                        )}
                      >
                        {messages[index].dateObj.toLocaleString("en-us", {
                          month: "short",
                          day: "2-digit",
                          year: "numeric",
                        })}
                      </div>
                    )}
                  <div
                    className="messageHeader"
                    role="group"
                    aria-label={`${message.user} at ${messages[index].time}`}
                  >
                    {index === 0 && (
                      <div className="username" role="heading" aria-level="2">
                        {message.user}
                      </div>
                    )}
                    {index > 0 &&
                      (messages[index].user !== messages[index - 1].user ||
                        messages[index].dateObj.toDateString() !==
                          messages[index - 1].dateObj.toDateString()) && (
                        <div className="username" role="heading" aria-level="2">
                          {message.user}
                        </div>
                      )}
                    {index === 0 && (
                      <div
                        className="initialTime"
                        aria-label={`Sent at ${messages[index].time}`}
                      >
                        {messages[index].time}
                      </div>
                    )}
                    {index > 0 &&
                      (new Date(messages[index].dateObj).getTime() -
                        new Date(messages[index - 1].dateObj).getTime() >=
                        5 * 60 * 1000 ||
                        messages[index].user !== messages[index - 1].user) && (
                        <div
                          className="timeElapsed"
                          aria-label={`Sent at ${messages[index].time}`}
                        >
                          {messages[index].time}
                        </div>
                      )}
                  </div>
                  <div
                    className="messageText"
                    aria-label={`Message: ${message.message}`}
                  >
                    {message.message}
                    {context.user.is_admin === true && (
                      <button onClick={() => deleteMessage(message.id)}>
                        Delete
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
      {user && (
        <div className="sendMessage" role="region" aria-label="Compose message">
          {isBlocked ? (
            <div role="alert">You've been Blocked by this user</div>
          ) : (
            <form
              className="sendMessageForm fadeInStaggered"
              role="form"
              aria-label="Send a new message"
            >
              <div style={{ position: "relative", display: "inline-block" }}>
                <textarea
                  className="sendMessageInput"
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    setConversationName(chat.name);
                    const textarea = e.target;
                    textarea.style.height = "auto";
                    const computed = window.getComputedStyle(textarea);
                    const paddingTop = parseFloat(computed.paddingTop);
                    const paddingBottom = parseFloat(computed.paddingBottom);
                    const borderTop = parseFloat(computed.borderTopWidth);
                    const borderBottom = parseFloat(computed.borderBottomWidth);

                    const totalExtra =
                      paddingTop + paddingBottom + borderTop + borderBottom;

                    const newHeight = Math.max(
                      textarea.scrollHeight - totalExtra,
                      44
                    );
                    textarea.style.height = `${newHeight}px`;
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage(e);
                    }
                  }}
                  rows={1}
                  ref={inputRef}
                  aria-label="Type your message here"
                />
              </div>
              <button
                className="sendMessageButton"
                onClick={sendMessage}
                aria-label="Send message"
              >
                <img
                  className="sendMessageImage"
                  src="/sendMessageGrey.png"
                  alt="Send User Message"
                ></img>
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
export default HomeChatComponent;
