import React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import { UserContext } from './userContext';

export const UserChatsContext = createContext({ chatList: null, currentChat: { name: "" } });

export const UserChats = ({ children }) => {
  const userContext = useContext(UserContext);
  const [chatList, setChatList] = useState(null);
  const [currentChat, setCurrentChat] = useState({name: "main", conversationID: 1});

  useEffect(() => {
    const getChats = async () => {
       if (!userContext?.user?.id) {
        
        return;
      }
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/messages/userChats?userID=${userContext.user.id}`,
          {
            method: 'GET',
            credentials: 'include',
          }
        );

        const data = await response.json();
        setChatList(data);
        
      } catch (err) {
        console.error('Error getting user chats: ' + err);
      }
    };

    if (userContext && userContext.user && userContext.user.id) {
      getChats();
    }
  }, [userContext]);

  const changeChat = (chat) => {
    console.log(chat);
    setCurrentChat(chat);
  }

  const resetChatList = () => {
    
    setChatList('');
  }

  return (
    <UserChatsContext.Provider value={{ chatList, currentChat, changeChat, resetChatList}}>
      {children}
    </UserChatsContext.Provider>
  );
};
