import React from 'react';
import { useContext, useState, useEffect } from 'react';
import { UserChatsContext } from '../context/chatListContext';

const SideBarComponent = () => {
    const chatContext = useContext(UserChatsContext);
    const [listOfChats, setListOfChats] = useState(null);

    
    useEffect(() => {
        if (chatContext?.chatList?.userChats) {
            setListOfChats(chatContext.chatList.userChats);
        }
    }, [chatContext]);

    const changeChat = (chat) => {

        //IF NAME THEN CHANGE CHANGE TO CHAT NAME FOR HOME.JS
        if (chat.name || chat.conversation_id) {
            chatContext.changeChat({ name: chat.name, conversationID: chat.conversation_id })
        } else if (chat.conversation_id) {

        }
        //IF NO NAME THEN CHANGE CHAT NAME TO CONVERSATION_ID
        //CHANGE HOME.JS TO
        //IF INT FETCH BY CONVERSATION ID INSTEAD OF NAME;
    }

    return listOfChats ? (
        <div className="sideBar">
            <ul>
            {listOfChats.map((chat, index) => (
                <li key={index}><button onClick={()=>changeChat(chat)}>{chat.name}</button></li>
            ))}
            </ul>
        </div>
    ) : (
        <div>loading ... </div>
    )
}



export default SideBarComponent;
