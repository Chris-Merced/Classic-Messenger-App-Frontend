import React from "react";
import { Link } from "react-router-dom";
import { useContext, useEffect, useState, useRef } from "react";
import { UserContext } from "../context/userContext";

const FriendRequests = () => {
  const userContext = useContext(UserContext);
  const user = userContext.user;
  const [friendRequests, setFriendRequests] = useState("");
  const [friends, setFriends] = useState([]);
  const [isFriendRequests, setIsFriendRequests] = useState(true);
  const [isFriendsList, setIsFriendsList] = useState(true);
  const itemRef = useRef([]);

  useEffect(() => {
    const getFriends = async () => {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/userProfile/getFriends?userID=${user.id}`
      );
      const data = await response.json();
      if (data) {
        setFriends(data.friendsList);
      }
    };
    if (user) {
      getFriends();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      setFriendRequests(user.friendRequests);
    }
  }, [user.friendRequests]);


  const addFriend = async (requestID) => {
    const data = {
      userID: user.id,
      requestID: requestID,
    };

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
          }
        }
      }
    }

  };

  const denyFriend = async (requestID) => {
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
            }
          }
        }
      }
    }
  };

  const removeFriend = async (friendID) => {
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
    const data = await response.json();

    console.log(data);
  };

  const changeIsFriendsList = () => {
    setIsFriendsList((prev) => !prev);
  };

  const changeIsFriendRequest = () => {
    setIsFriendRequests((prev) => !prev);
    console.log("friend request state" + !isFriendRequests);
  };

  return friendRequests && userContext ? (
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
                    onClick={() => removeFriend(friend.id)}
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
