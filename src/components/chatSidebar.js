import React from 'react';
import { useContext, useState, useEffect } from 'react';
import { UserContext } from '../context/userContext';
import { UserChatsContext } from '../context/chatListContext';

const SideBarComponent = () => {
    const chatContext = useContext(UserChatsContext);
    const userContext = useContext(UserContext);
  const [listOfChats, setListOfChats] = useState(null);

  useEffect(() => {
    if (chatContext?.chatList?.userChats) {
      setListOfChats(chatContext.chatList.userChats);
    }
  }, [chatContext.chatList]);

  const changeChat = (chat) => {
    //IF NAME THEN CHANGE CHANGE TO CHAT NAME FOR HOME.JS
    if (chat.name) {
      chatContext.changeChat({
        name: chat.name,
        conversationID: chat.conversation_id,
      });
    } else {
        chatContext.changeChat({
            name: null,
            conversationID: chat.conversation_id,
            reciever: chat.participants,
        })
    }
    //IF NO NAME THEN CHANGE CHAT NAME TO CONVERSATION_ID
    //CHANGE HOME.JS TO
    //IF INT FETCH BY CONVERSATION ID INSTEAD OF NAME;
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
