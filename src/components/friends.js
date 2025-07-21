import React from "react";
import { Link } from "react-router-dom";
import { useContext, useEffect, useState, useRef } from "react";
import { UserContext } from "../context/userContext";
import { UserChatsContext } from "../context/chatListContext";
import { WebsocketContext } from "../context/websocketContext";

const FriendRequests = () => {
  const [friendRequests, setFriendRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [isFriendRequests, setIsFriendRequests] = useState(true);
  const [isFriendsList, setIsFriendsList] = useState(true);

  const userContext = useContext(UserContext);
  const chatContext = useContext(UserChatsContext);
  const socketRef = useContext(WebsocketContext);
  const itemRef = useRef([]);

  const user = userContext.user;

  useEffect(() => {
    if (chatContext?.chatList) {
      try {

        if (socketRef.current) {
          socketRef.current.onmessage = null;
        }

        socketRef.current.onmessage = async (message) => {
          message = JSON.parse(message.data);
          let modifiedChatList = chatContext.chatList;
          console.log(message);
          if (message.type === "message") {
            for (let i = 0; i < modifiedChatList.userChats.length; i++) {
              if (
                modifiedChatList.userChats[i].conversation_id ===
                message.conversationID
              ) {
                modifiedChatList.userChats[i].is_read = false;
              }
            }
            chatContext.changeChatList({
              ...chatContext.chatList,
              userChats: [...modifiedChatList.userChats],
            });

            for (let i = 0; i < modifiedChatList.userChats.length; i++) {
              if (
                modifiedChatList.userChats[i].conversation_id ===
                  message.conversationID &&
                message.conversationID !== 1
              ) {
                const tempItem = modifiedChatList.userChats.splice(i, 1)[0];
                modifiedChatList.userChats.splice(1, 0, tempItem);
                chatContext.changeChatList({
                  ...chatContext.chatList,
                  userChats: [...modifiedChatList.userChats],
                });
              }
            }
          } else if (message.type === "friendRequest") {
            userContext.addFriendRequest({
              id: parseInt(message.requestID),
              username: message.user,
            });
          }
        };
      } catch (err) {
        console.log("Error managing websocket message" + err.message);
      }
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.onmessage = null;
      }
    };
  }, [chatContext]);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const getFriends = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/userProfile/getFriends?userID=${user.id}`,
          { signal }
        );
        const data = await response.json();
        if (data) {
          setFriends(data.friendsList);
        }
      } catch (err) {
        if (err.name === "AbortError") {
          console.log("Fetch Aborted");
        } else {
          console.log("Error fetching friends: \n" + err.message);
        }
      }
    };
    if (user) {
      getFriends();
    }

    return () => {
      controller.abort();
    };
  }, [user]);

  useEffect(() => {
    if (user && user.friendRequests) {
      setFriendRequests(user.friendRequests);
    } else {
      setFriendRequests([]);
    }
  }, [user]);

  const addFriend = async (requestID) => {
    try {
      const data = {
        userID: user.id,
        requestID: requestID,
      };
      console.log("DATA FOR FRIEND REQUEST:")
      console.log(data)
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/userProfile/addFriend`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(data),
        }
      );

      if (response.ok) {
        if (itemRef.current[requestID]) {
          for (let i = 0; i < user.friendRequests.length; i++) {
            if (user.friendRequests[i].id === requestID) {
              user.friendRequests.splice(i, 1);
              console.log(user.friendRequests);
              user.friendRequests = [...user.friendRequests];
            }
          }
        }

        userContext.modifyUser({ ...user });
      }
    } catch (err) {
      console.log("Error adding friend: \n" + err.message);
    }
  };

  const denyFriend = async (requestID) => {
    try {
      const data = {
        userID: user.id,
        requestID: requestID,
      };

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/userProfile/denyFriend`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(data),
        }
      );

      if (response.ok) {
        if (itemRef.current[requestID]) {
          if (itemRef.current[requestID]) {
            for (let i = 0; i < user.friendRequests.length; i++) {
              if (user.friendRequests[i].id === requestID) {
                user.friendRequests.splice(i, 1);
                user.friendRequests = [...user.friendRequests];
              }
            }
          }
        }

        userContext.modifyUser({ ...user });
      }
    } catch (err) {
      console.log("Error denying friend request: \n" + err.message);
    }
  };

  const removeFriend = async (friendID, index) => {
    try {
      const body = { userID: user.id, friendID: friendID };
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/userProfile/removeFriend`,
        {
          method: "DELETE",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      if (response.ok) {
        setFriends(friends.filter((friend) => friend.id !== friendID));
      }
      const data = await response.json();

      console.log(data);
    } catch (err) {
      console.log("Error removing friend from friends list:  \n" + err.message);
    }
  };

  const changeIsFriendsList = () => {
    setIsFriendsList((prev) => !prev);
  };

  const changeIsFriendRequest = () => {
    setIsFriendRequests((prev) => !prev);
    console.log("friend request state" + !isFriendRequests);
  };


  return user && userContext ? (
    <div className="friendsContent" role="region" aria-label="Friends overview">
      <div
        className="friendsListComponent"
        role="region"
        aria-labelledby="friends-list-heading"
      >
        {isFriendsList ? (
          <button
            id="friends-list-heading"
            className="friendsListButton"
            onClick={changeIsFriendsList}
            aria-expanded={isFriendsList}
            aria-controls="friends-list"
          >
            <h1>
              Friends{" "}
              <img
                className="chevron"
                src="/chevronDownGrey.svg"
                alt="Toggle friends list"
              />
            </h1>
          </button>
        ) : (
          <button
            id="friends-list-heading"
            className="friendsListButton"
            onClick={changeIsFriendsList}
            aria-expanded={isFriendsList}
            aria-controls="friends-list"
          >
            <h1>
              Friends{" "}
              <img
                className="chevron"
                src="/chevronUpGrey.png"
                alt="Toggle friends list"
              />
            </h1>
          </button>
        )}

        {friends && (
          <ul
            id="friends-list"
            className={`friendsList ${isFriendsList ? "show" : "hide"}`}
            role="list"
          >
            {friends.length === 0 ? (
              <li role="status">You have no friends, sad</li>
            ) : (
              friends.map((friend, index) => (
                <li className="friend" key={index} role="listitem">
                  <Link
                    to={`${process.env.REACT_APP_FRONTEND_URL}/userProfile/${friend.id}`}
                  >
                    {" "}
                    {friend.username}{" "}
                  </Link>
                  <button
                    className="friendsListItemButton"
                    onClick={() => removeFriend(friend.id, index)}
                    aria-label={`Remove friend ${friend.username}`}
                  >
                    Remove Friend
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
      </div>

      <div
        className="friendRequests"
        role="region"
        aria-labelledby="friend-requests-heading"
      >
        <button
          id="friend-requests-heading"
          className="friendRequestsListButton"
          onClick={changeIsFriendRequest}
          aria-expanded={isFriendRequests}
          aria-controls="friend-requests-list"
        >
          <h1>
            Friend Requests{" "}
            <img
              className="chevron"
              src={
                isFriendRequests ? "/chevronDownGrey.svg" : "/chevronUpGrey.png"
              }
              alt="Toggle friend requests list"
            />
          </h1>
        </button>

        {friendRequests.length !== 0 ? (
          <ul
            id="friend-requests-list"
            className={`friendRequestList ${
              isFriendRequests ? "show" : "hide"
            }`}
            role="list"
          >
            {friendRequests.map((request) => (
              <li
                className="friendRequestListItem"
                key={request.id}
                ref={(el) => (itemRef.current[request.id] = el)}
                role="listitem"
              >
                <span>{request.username}</span>
                <button
                  onClick={() => addFriend(request.id)}
                  aria-label={`Accept friend request from ${request.username}`}
                >
                  Accept
                </button>
                <button
                  onClick={() => denyFriend(request.id)}
                  aria-label={`Deny friend request from ${request.username}`}
                >
                  Deny
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div
            className="noFriendsDisplay"
            role="status"
            aria-label="No friend requests"
          />
        )}
      </div>
    </div>
  ) : (
    <div role="alert">You need to log in to view friends</div>
  );
};

export default FriendRequests;
