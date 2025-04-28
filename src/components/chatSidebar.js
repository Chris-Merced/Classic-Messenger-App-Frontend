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
  const [islight, setIsLight] = useState(null);

  useEffect(() => {
    if (chatContext?.chatList?.userChats) {
      setListOfChats(chatContext.chatList.userChats);
      setUnmodifiedChatList(listOfChats);
    }
  }, [chatContext.chatList]);

  useEffect(() => {
    setIsLight(document.body.classList.contains("light-theme"));
  }, []);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsLight(document.body.classList.contains("light-theme"));
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

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

  useEffect(() => {
    if (listOfChats && !userContext.hasInitializedRef.current) {
      let chat = listOfChats[0];

      chatContext.changeChat({
        name: chat.name,
        conversationID: chat.conversation_id,
        reciever: chat.participants,
      });

      userContext.hasInitializedRef.current = true;
    }
  }, [listOfChats]);

  const isSideBarSearch = () => {
    setSidebarSearch((prev) => !prev);
  };

  const changeDisplayedChatList = (search) => {
    setListOfChats(unmodifedChatList);
    if (search === "") {
      return;
    }
    setListOfChats((prev) =>
      prev.filter((chat) => {
        const regex = new RegExp(search);

        if (!chat.name) {
          if (regex.test(chat.participants[0].toString())) {
            return chat;
          }
        }
      })
    );
  };


  return listOfChats && userContext.user ? (
    <div className="sideBar fadeInStaggered">
      <ul className={`chatList ${sidebarSearch ? "show" : "hide"}`}>
        <div className="sideBarSearch">
          <input
            className="sideBarSearch"
            onChange={(e) => changeDisplayedChatList(e.target.value)}
            onBlur={(e) => {
              setTimeout(() => {
                setSidebarSearch("");
                changeDisplayedChatList("");
                e.target.value = "";
              }, 150);
            }}
          ></input>
          <img className="sideBarSearchIcon" src="searchIcon.svg"></img>
        </div>
        {listOfChats.map(
          (chat, index) =>
            chat && (
              <li className="chat" key={index}>
                {!chat.name &&
                  chat.participants.length === 1 &&
                  chat.profilePicture && (
                    <img
                      onClick={() => changeChat(chat)}
                      className="sideBarProfilePicture"
                      src={chat.profilePicture}
                    ></img>
                  )}
                {!chat.name &&
                  chat.participants.length === 1 &&
                  !chat.profilePicture &&
                  !islight && (
                    <img
                      className="sideBarProfilePicture"
                      src="/defaultProfileImageLight.webp"
                    ></img>
                  )}
                {!chat.name &&
                  chat.participants.length === 1 &&
                  !chat.profilePicture &&
                  islight && (
                    <img
                      className="sideBarProfilePicture"
                      src="/defaultProfileImage.png"
                    ></img>
                  )}
                <button className="chatButton" onClick={() => changeChat(chat)}>
                  {chat.name ? chat.name : chat.participants}
                </button>
                {!chat.is_read && <div>wow lazy</div>}
                {chat.participants &&
                chat.participants.length === 1 &&
                activeUsers[chat.participants] ? (
                  <div className="online"></div>
                ) : (
                  <div className="offline"></div>
                )}
              </li>
            )
        )}
      </ul>
    </div>
  ) : (
    <div></div>
  );
};

export default SideBarComponent;
