import React from "react";
import { useContext, useState, useEffect } from "react";
import { UserContext } from "../context/userContext";
import { UserChatsContext } from "../context/chatListContext";
import { useNavigate, useLocation } from "react-router-dom";

// CAN ADD PRIVATE AND PUBLIC FUNCTIONALITY BY ADDING USER ATTRIBUTE TO TABLE
// CHECK AND SEE IF WE CAN FIGURE OUT WHY THE ONLINEUSERS LIST GETS INCREDIBLY LONG
// SHOULD BE UPDATING THE LIST NOT ADDING TO THE LIST, IS PROBABLY WHY FUNCTIONALITY IS NOT 100 PERCENT




const SideBarComponent = () => {
  const chatContext = useContext(UserChatsContext);
  const userContext = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [listOfChats, setListOfChats] = useState(null);
  const [activeUsers, setActiveUsers] = useState({});

  useEffect(() => {
    if (chatContext?.chatList?.userChats) {
      setListOfChats(chatContext.chatList.userChats);
    }
  }, [chatContext.chatList]);

  useEffect(() => {
    chatContext.changeLocation(location);
  }, [location]);

  useEffect(() => {
    var usersList = [];

    const getOnlineUsers = async () => {
      if (listOfChats) {
        listOfChats.map((chat) => {
          if (chat.participants !== null && chat.participants.length === 1) {
            usersList.push(chat.participants[0]);
          }
        });
      }
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/conversations/getOnlineUsers?userList=${usersList}`
      );
      const data = await response.json();
      setActiveUsers(data.activeUsers);
    };
    if (listOfChats) {
      getOnlineUsers();
      setInterval(() => {
        getOnlineUsers();
      }, 15000);
    }
  }, [listOfChats]);

  const changeChat = (chat) => {

    if (chat.name) {
      chatContext.changeChat({
        name: chat.name,
        conversationID: chat.conversation_id,
      });
      if (location.pathname !== "/") {
        navigate("/");
      }
    } else {
      chatContext.changeChat({
        name: null,
        conversationID: chat.conversation_id,
        reciever: chat.participants,
      });
      if (location.pathname !== "/") {
        navigate("/");
      }
    }
  };

  return listOfChats && userContext.user ? (
    <div className="sideBar">
      <ul>
        {listOfChats.map((chat, index) => (
          <li key={index}>
            <button onClick={() => changeChat(chat)}>
              {chat.name ? chat.name : chat.participants}
            </button>
            {chat.participants &&
            chat.participants.length === 1 &&
            activeUsers[chat.participants] ? (
              <div className="online">online</div>
            ) : (
              <div className="offline"></div>
            )}
          </li>
        ))}
      </ul>
    </div>
  ) : (
    <div></div>
  );
};

export default SideBarComponent;
