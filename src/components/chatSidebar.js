import React from "react";
import {
  useContext,
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
} from "react";
import { UserContext } from "../context/userContext";
import { UserChatsContext } from "../context/chatListContext";
import { useNavigate, useLocation } from "react-router-dom";

const SideBarComponent = () => {
  const chatContext = useContext(UserChatsContext);
  const userContext = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  const intervalRef = useRef(null);
  const unmodifiedChatList = useRef(null);
  const pageRef = useRef(0);
  const chatListRef = useRef(null);

  const [listOfChats, setListOfChats] = useState(null);
  const [activeUsers, setActiveUsers] = useState({});
  const [sidebarSearch, setSidebarSearch] = useState(false);
  const [islight, setIsLight] = useState(null);
  const [sideBarExtend, setSideBarExtend] = useState(false);

  useEffect(() => {
    if (chatContext?.chatList?.userChats) {
      setListOfChats(chatContext.chatList.userChats);
      unmodifiedChatList.current = chatContext.chatList.userChats;
    }
  }, [chatContext.chatList]);

  useEffect(() => {
    setIsLight(document.body.classList.contains("light-theme"));
  }, []);

  useLayoutEffect(() => {
    if (!chatListRef.current) {
      return;
    }
    const container = chatListRef.current;
    const scrollHandle = () => {
      if (
        container.scrollTop + container.clientHeight >=
        container.scrollHeight
      ) {
        pageRef.current += 1;
        chatContext.getChats(pageRef.current);
      }
    };
    container.addEventListener("scroll", scrollHandle);
    return () => container.removeEventListener("scroll", scrollHandle);
  }, [chatListRef.current]);

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

    const controller = new AbortController();
    const signal = controller.signal;

    const getOnlineUsers = async () => {
      const usersList = listOfChats
        .filter((chat) => chat.participants && chat.participants.length === 1)
        .map((chat) => chat.participants[0]);

      try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/conversations/getOnlineUsers?userList=${usersList}`,
          { signal }
        );
        const data = await response.json();
        setActiveUsers(data.activeUsers);
      } catch (error) {
        if (error.name === "AbortError") {
          console.log("Fetch Aborted");
        } else {
          console.error("Error fetching online users:", error);
        }
      }
    };

    getOnlineUsers();
    intervalRef.current = setInterval(getOnlineUsers, 5000);

    return () => {
      clearInterval(intervalRef.current);
      controller.abort();
    };
  }, [listOfChats]);

  const changeChat = async (chat) => {
    if (chat.name) {
      chatContext.changeChat({
        name: chat.name,
        conversationID: chat.conversation_id,
        reciever: chat.participants,
      });
      if (location.pathname !== "/") {
        navigate("/");
      }
      setSideBarExtend(false);
    } else {
      console.log(chat);
      console.log(chatContext.chatList);

      console.log(chat.participants[0]);
      const newResponse = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/userProfile/userIDByUsername?id=${chat.participants[0]}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      const data = await newResponse.json();
      console.log(data);

      chatContext.changeChat({
        name: null,
        conversationID: chat.conversation_id,
        reciever: chat.participants,
        pictureURL: chat.profilePicture,
      });

      if (location.pathname !== "/") {
        navigate("/");
      }

      setSideBarExtend(false);
      console.log(chat)

      const isReadData = {
        conversationID: chat.conversation_id,
        senderID: data.id,
      };

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/conversations/isRead`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(isReadData),
          credentials: "include",
        }
      );
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
    setListOfChats(unmodifiedChatList.current);
    if (search === "") {
      return;
    }
    setListOfChats((prev) => {
      let newListOfChats = prev.filter((chat) => {
        const regex = new RegExp(search);

        if (!chat.name) {
          if (regex.test(chat.participants[0].toString())) {
            return chat;
          }
        }
        if (chat.name) {
          return chat;
        }
      });
      return newListOfChats;
    });
  };

  const updateIsRead = (chat) => {
    let modifiedChatList = chatContext.chatList;

    for (let i = 0; i < modifiedChatList.userChats.length; i++) {
      if (
        modifiedChatList.userChats[i].conversation_id === chat.conversation_id
      ) {
        modifiedChatList.userChats[i].is_read = true;
      }
    }

    chatContext.changeChatList({
      ...modifiedChatList,
      userChats: [...modifiedChatList.userChats],
    });
  };

  const updateSideBarExtend = (e) => {
    e.preventDefault();
    sideBarExtend ? setSideBarExtend(false) : setSideBarExtend(true);
  };

  if (!listOfChats || !userContext.user) return <div aria-hidden="true"></div>;

  return listOfChats && userContext.user ? (
    <>
      <div>
        <button
          className={`sideBarExtender ${sideBarExtend ? "show" : "hide"}`}
          onClick={updateSideBarExtend}
        >
          <img
            src={`${
              sideBarExtend
                ? "https://classic-messenger-profile-pics.s3.us-east-2.amazonaws.com/websiteAssets/ChevronLeft.svg"
                : "https://classic-messenger-profile-pics.s3.us-east-2.amazonaws.com/websiteAssets/ChevronRight.svg"
            }`}
          ></img>
        </button>
      </div>
      <div
        className={`sideBar ${sideBarExtend ? "show" : "hide"} fadeInStaggered`}
        role="navigation"
        aria-label="Chat navigation"
      >
        <ul
          className={`chatList ${
            sidebarSearch ? "show" : "hide"
          } scroll-container`}
          role="list"
          ref={chatListRef}
        >
          <div className="sideBarSearch" role="search">
            <input
              type="search"
              className="sideBarSearch"
              aria-label="Search chats"
              onChange={(e) => changeDisplayedChatList(e.target.value)}
              onBlur={(e) => {
                setTimeout(() => {
                  setSidebarSearch("");
                  changeDisplayedChatList("");
                  e.target.value = "";
                }, 150);
              }}
            ></input>
            <img
              className="sideBarSearchIcon"
              src="https://classic-messenger-profile-pics.s3.us-east-2.amazonaws.com/websiteAssets/searchIcon.svg"
              role="button"
              aria-label="Toggle search"
              aria-hidden="true"
            ></img>
          </div>
          {listOfChats.map(
            (chat, index) =>
              chat && (
                <li className="chat" key={index} role="listitem">
                  {!chat.name &&
                    chat.participants.length === 1 &&
                    chat.profilePicture && (
                      <img
                        onClick={() => changeChat(chat)}
                        className="sideBarProfilePicture"
                        src={chat.profilePicture}
                        alt={`${chat.participants} profile picture`}
                      ></img>
                    )}
                  {!chat.name &&
                    chat.participants.length === 1 &&
                    !chat.profilePicture &&
                    !islight && (
                      <img
                        onClick={() => changeChat(chat)}
                        className="sideBarProfilePicture"
                        src="/defaultProfileImageLight.webp"
                        alt="User profile placeholder"
                      ></img>
                    )}
                  {!chat.name &&
                    chat.participants.length === 1 &&
                    !chat.profilePicture &&
                    islight && (
                      <img
                        onClick={() => changeChat(chat)}
                        className="sideBarProfilePicture"
                        src="/defaultProfileImage.png"
                        alt="User profile placeholder"
                      ></img>
                    )}
                  <button
                    className="chatButton"
                    onClick={() => {
                      changeChat(chat);
                      updateIsRead(chat);
                    }}
                    aria-current={
                      chatContext.currentChat?.conversationID ===
                      chat.conversation_id
                        ? "page"
                        : undefined
                    }
                  >
                    {chat.name ? chat.name : chat.participants}
                  </button>
                  {!chat.is_read && (
                    <div
                      className="messageNotification"
                      role="status"
                      aria-label="Unread messages"
                    ></div>
                  )}
                  {chat.participants &&
                  chat.participants.length === 1 &&
                  activeUsers[chat.participants] ? (
                    <div
                      className="online"
                      role="status"
                      aria-label="User online"
                    ></div>
                  ) : (
                    <div
                      className="offline"
                      role="status"
                      aria-label="User offline"
                    ></div>
                  )}
                </li>
              )
          )}
        </ul>
      </div>
    </>
  ) : (
    <div></div>
  );
};

export default SideBarComponent;
