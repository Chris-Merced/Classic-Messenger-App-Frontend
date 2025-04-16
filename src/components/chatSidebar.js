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
  const [sidebarSearch, setSidebarSearch] = useState(false);
  const [unmodifedChatList, setUnmodifiedChatList] = useState([]);

  useEffect(() => {
    if (chatContext?.chatList?.userChats) {
      setListOfChats(chatContext.chatList.userChats);
      setUnmodifiedChatList(listOfChats);
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

    console.log(listOfChats)

    const getOnlineUsers = async () => {
      const usersList = listOfChats
        .filter((chat) => chat.participants && chat.participants.length === 1)
        .map((chat) => chat.participants[0]);

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

  useEffect(() => {
    if (listOfChats) {
      const chat = listOfChats[0];
      console.log("CHECKING FIRST INDEX OF ARRAY LIST OF CHATS");
      console.log(listOfChats[0]);

      chatContext.changeChat({
        name: chat.name,
        conversationID: chat.conversation_id,
        reciever: chat.participants,
      });
    }
  }, []);

  const changeChat = (chat) => {
    if (chat.name) {
      chatContext.changeChat({
        name: chat.name,
        conversationID: chat.conversation_id,
        reciever: chat.participants,
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

  const isSideBarSearch = () => {
    setSidebarSearch((prev) => !prev);
  };

  const changeDisplayedChatList = (search) => {
    listOfChats.forEach(chat => {
      console.log(chat)
    });

    setListOfChats(unmodifedChatList);
    if(search===''){
      return;
    }
    setListOfChats((prev)=>prev.filter((chat)=>{
      const regex = new RegExp(search)
      
      if(!chat.name){
        console.log(search)
        console.log(chat.participants[0])
        console.log(regex.test(chat.participants[0]))
        if(regex.test(chat.participants[0].toString())){
          console.log("made it1")
          return chat
        }
        
      }
    }))

  };

  return listOfChats && userContext.user ? (
    <div className="sideBar fadeInStaggered">
      <ul className={`chatList ${sidebarSearch ? "show" : "hide"}`}>
        <button className="sideBarSearchButton" onClick={isSideBarSearch}>
          Search
        </button>
        {sidebarSearch && (
          <input
            className="sideBarSearch"
            onChange={(e) => changeDisplayedChatList(e.target.value)}
          ></input>
        )}
        {listOfChats.map((chat, index) => (
          chat &&
          <li className="chat" key={index}>
            {!chat.name && chat.participants.length===1 && <img onClick={()=> changeChat(chat)} className="sideBarProfilePicture" src={chat.profilePicture}></img>}
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
