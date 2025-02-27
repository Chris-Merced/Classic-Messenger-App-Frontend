import React from "react";
import { useContext, useState, useEffect } from "react";
import { UserContext } from "../context/userContext";
import { UserChatsContext } from "../context/chatListContext";
import { useNavigate, useLocation } from "react-router-dom";

const SideBarComponent = () => {
  const chatContext = useContext(UserChatsContext);
  const userContext = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [listOfChats, setListOfChats] = useState(null);

  useEffect(() => {
    if (chatContext?.chatList?.userChats) {
      setListOfChats(chatContext.chatList.userChats);
    }
  }, [chatContext.chatList]);

  /*useEffect(() => {
    var usersList = [];

    const getOnlineUsers = async () => {
      if (listOfChats) {
        listOfChats.map((chat) => {
          chat.participants !== null && chat.participants.length === 1
            ? usersList.push(chat.participants[0])
            : console.log("chat is more than one person");
        });
      }
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/conversations/getOnlineUsers?userList=${usersList}`
      );
      const data = await response.json();
      console.log(data);
    };
    if (listOfChats) {
      getOnlineUsers();
    }
  }, [listOfChats]);*/

  const changeChat = (chat) => {
    //IF NAME THEN CHANGE CHANGE TO CHAT NAME FOR HOME.JS
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
          </li>
        ))}
      </ul>
    </div>
  ) : (
    <div></div>
  );
};

export default SideBarComponent;
