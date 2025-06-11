import React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import { UserContext } from "./userContext";

export const UserChatsContext = createContext({
  chatList: null,
  currentChat: { name: "" },
});

export const UserChats = ({ children }) => {
  const userContext = useContext(UserContext);
  const [chatList, setChatList] = useState(null);
  const [location, setLocation] = useState("");
  const [currentChat, setCurrentChat] = useState();

  const getChats = async (page=0) => {
    if (!userContext?.user?.id) {
      return;
    }
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/messages/userChats?userID=${userContext.user.id}&page=${page}&limit=16`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();
      console.log(data);
      if (!chatList) {
        setChatList(data);
      } else {
        setChatList((prev) => {const newChatList = [...prev.userChats, ...data.userChats]
          return newChatList
        });
      }
    } catch (err) {
      console.error("Error getting user chats: " + err);
    }
  };

  useEffect(() => {
    if (userContext && userContext.user && userContext.user.id) {
      getChats();
    }
  }, [userContext, location]);

  const changeChat = (chat) => {
    setCurrentChat(chat);
  };

  const resetChatList = () => {
    setChatList("");
  };

  const changeChatList = (data) => {
    setChatList(data);
  };

  const changeLocation = (location) => {
    setLocation(location);
  };

  return (
    <UserChatsContext.Provider
      value={{
        chatList,
        currentChat,
        changeChat,
        resetChatList,
        changeLocation,
        changeChatList,
      }}
    >
      {children}
    </UserChatsContext.Provider>
  );
};
