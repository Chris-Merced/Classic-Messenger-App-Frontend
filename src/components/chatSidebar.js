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
  const [activeUsers, setActiveUsers] = useState({});

  useEffect(() => {
    console.log("TESTING IF USEEFFECT FOR CHAT SIDEBAR IS TRIGGERED");
    console.log(location.pathname);
    if (chatContext?.chatList?.userChats) {
      setListOfChats(chatContext.chatList.userChats);
    }
  }, [chatContext.chatList]);

  useEffect(() => {
    console.log(
      "CHECKING IF WE MAKE IT TO CHANGE LOCATION IN SIDEBAR COMPONENT"
    );
    chatContext.changeLocation(location);
  }, [location]);


  useEffect(() => {
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
      setActiveUsers(data.activeUsers);
    };
    if (listOfChats) {
      getOnlineUsers();
      setInterval(()=>{
        getOnlineUsers()
      }, 3000)
    }
  }, [listOfChats]);

  const changeChat = (chat) => {
    //IF NAME THEN CHANGE TO CHAT NAME FOR HOME.JS
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
