import React from "react";
import { Link } from "react-router-dom";
import { useContext, useEffect, useState, useRef } from "react";
import { UserContext } from "../context/userContext";

const FriendRequests = () => {
  const userContext = useContext(UserContext);
  const user = userContext.user;
  const [friendRequestsLength, setFriendRequestsLength] = useState(0);
  const [friendRequests, setFriendRequests] = useState("");
  const [friends, setFriends] = useState([]);
  const [isFriendRequests, setIsFriendRequests] = useState(true);
  const [isFriendsList, setIsFriendsList] = useState(true);
  const itemRef = useRef([]);

  useEffect(() => {
    const getFriendRequests = async () => {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/userProfile/friendRequest?userID=${user.id}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      const data = await response.json();
      setFriendRequests(data.friendRequests);
    };
    if (user) {
      getFriendRequests();
    }

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
    if (friendRequests) {
      setFriendRequestsLength(friendRequests.length);
    }
  }, [friendRequests]);

  const addFriend = async (requestID, index) => {
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
      if (itemRef.current[index]) {
        itemRef.current[index].style.display = "none";
      }
    }

    setFriendRequestsLength(friendRequestsLength - 1);
  };

  const denyFriend = async (requestID, index) => {
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
      if (itemRef.current[index]) {
        itemRef.current[index].style.display = "none";
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

  const changeIsFriendsList = () =>{
    setIsFriendsList((prev)=>(!prev))
  }

  const changeIsFriendRequest = () => {
    setIsFriendRequests((prev) => !prev);
    console.log("friend request state" + !isFriendRequests);
  };

  return friendRequests && userContext ? (
    <div className="friendsContent">
      <div className="friendsListComponent">
        {isFriendsList ? 
        <button className="friendsListButton" onClick={changeIsFriendsList}><h1>Friends <img className="chevron" src="/chevronDownGrey.svg"></img></h1></button>
        : 
        <button className="friendsListButton" onClick={changeIsFriendsList}><h1>Friends <img className="chevron" src="/chevronUpGrey.png"></img></h1></button>}
        {friends && (
          <ul className={`friendsList ${isFriendsList ? "show" : "hide"}`}>
            {friends.length === 0 ? (
              <div>You have no friends, sad</div>
            ) : (
              friends.map((friend, index) => {
                return (
                  <li className="friend" key={index}>
                    <Link
                      to={`${process.env.REACT_APP_FRONTEND_URL}/userProfile/${friend.id}`}
                    >
                      {friend.username}{" "}
                    </Link>
                    <button
                      className="friendsListItemButton"
                      onClick={() => removeFriend(friend.id)}
                    >
                      Remove Friend
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        )}
      </div>
      <div className="friendRequests">
        {isFriendRequests ? (
          <button className="friendRequestsListButton" onClick={changeIsFriendRequest}>
            <h1>Friend Requests <img className="chevron" src="/chevronDownGrey.svg"></img></h1>
          </button>
        ) : (
          <button className="friendRequestsListButton" onClick={changeIsFriendRequest}>
          <h1>Friend Requests <img className="chevron" src="/chevronUpGrey.png"></img></h1>
        </button>
        )}
        {friendRequests.length !== 0 ? (
          <ul
            className={`friendRequestList ${
              isFriendRequests ? "show" : "hide"
            }`}
          >
            {friendRequests.map((request, index) => {
              return (
                <li
                  className="friendRequestListItem"
                  key={index}
                  ref={(el) => (itemRef.current[index] = el)}
                >
                  {request.username}
                  <button
                    onClick={() => {
                      addFriend(request.id, index);
                    }}
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => {
                      denyFriend(request.id, index);
                    }}
                  >
                    Deny
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="noFriendsDisplay"></div>
        )}
      </div>
    </div>
  ) : (
    <div>You need to log in to view friends</div>
  );
};

export default FriendRequests;
