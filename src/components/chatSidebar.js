import React from "react";
import { useContext, useState, useEffect, useRef } from "react";
import { UserContext } from "../context/userContext";
import { UserChatsContext } from "../context/chatListContext";
import { useNavigate, useLocation } from "react-router-dom";

const SideBarComponent = () => {
  const chatContext = useContext(UserChatsContext);
  const userContext = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  const intervalRef = useRef(null);



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
    if (!listOfChats) return;
  
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  
    const getOnlineUsers = async () => {
      const usersList = listOfChats
        .filter(chat => chat.participants && chat.participants.length === 1) 
        .map(chat => chat.participants[0]); 
  
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/conversations/getOnlineUsers?userList=${usersList}`
        );
        const data = await response.json();
        setActiveUsers(data.activeUsers);
      } catch (error) {
        console.error("Error fetching online users:", error);
      }
    };
  
    getOnlineUsers(); 
    intervalRef.current = setInterval(getOnlineUsers, 15000); 
  
    return () => {
      clearInterval(intervalRef.current);
    };
  }, [listOfChats]); 

  useEffect(()=>{
    if(listOfChats){const chat = listOfChats[0];
    console.log("CHECKING FIRST INDEX OF ARRAY LIST OF CHATS")
    console.log(listOfChats[0])
    
      chatContext.changeChat({
        name: chat.name,
        conversationID: chat.conversation_id,
        reciever: chat.participants
      });
    }
  },[listOfChats])

  const changeChat = (chat) => {

    if (chat.name) {
      chatContext.changeChat({
        name: chat.name,
        conversationID: chat.conversation_id,
        reciever: chat.participants
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
      <ul className="chatList">
        {listOfChats.map((chat, index) => (
          <li className="chat" key={index}>
            <button className="chatButton" onClick={() => changeChat(chat)}>
              {chat.name ? chat.name : chat.participants}
            </button>
            {chat.participants &&
            chat.participants.length === 1 &&
            activeUsers[chat.participants] ? (
              <div className="online"></div>
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
