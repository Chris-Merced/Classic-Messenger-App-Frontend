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
  const [chat, setChat] = useState();
  const [isBlocked, setIsBlocked] = useState("");
  const mainChatRef = useRef(null);
  const inputRef = useRef(null);
  const spanRef = useRef(null);

  const context = useContext(UserContext);
  const socketRef = useContext(WebsocketContext);
  const userData = context.user;
  const chatContext = useContext(UserChatsContext);
  const { currentChat } = chatContext;

  //TEXT AREA COULD BE MADE TO LOOK MORE CLEAN FOR EDIT ABOUT ME
  //SEE HOW WE CAN MAKE IT TO WHERE WHITESPACE IS CAPTURED (I.E. HITTING ENTER TO CREATE PARAGRAPHS)

  //MAKE SURE THAT THE USER VALIDATION FOR SIGNUP IS LIKE THIS:
  //USER INPUTS NAME OF LOWER AND UPPER CASE LETTERS AND IT IS STORED THAT WAY IN DB
  //WHEN VALIDATING USER ALL VALIDATIONS ARE TOLOWER() SO ENTRY OF USERNAME IS NOT CASE SENSITIVE

  useEffect(() => {
    setUser(userData);
  }, [userData]);

  useEffect(() => {
    setChat({ ...currentChat });
  }, [currentChat]);

  useEffect(() => {
    if (mainChatRef.current) {
      mainChatRef.current.scrollTop = mainChatRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (spanRef.current && inputRef.current) {
      const width = spanRef.current.offsetWidth;
      inputRef.current.style.width = `${width + 20}px`;
    }
  }, [message]);

  useEffect(() => {
    const setupMessageHandler = async () => {
      socketRef.current.onmessage = async (message) => {
        console.log(message.data);

        message = JSON.parse(message.data);
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
    if (!chat || !chat.conversationID) return;

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

    const checkIfBlocked = async () => {
      if (!chat.name) {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/conversations/isBlocked?reciever=${chat.reciever[0]}&userID=${user.id}`
        );
        const data = await response.json();
        setIsBlocked(data);
      }
    };

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
      } else {
        console.log("console is not open");
      }
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
          {currentChat && (
            <h1 role="heading" aria-level="1">
              {currentChat.name ? currentChat.name : currentChat.reciever[0]}
            </h1>
          )}
          <div
            className="mainChat scroll-container"
            ref={mainChatRef}
            role="log"
            aria-live="polite"
            aria-label="Message log"
          >
            <ul className="MessageList" role="list">
              {messages.map((message, index) => (
                <li className="message" key={index} role="listitem">
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
