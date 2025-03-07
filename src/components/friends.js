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
  const itemRef = useRef([]);

  useEffect(() => {
    const getFriendRequests = async () => {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/userProfile/friendRequest?userID=${user.id}`
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
      console.log("accessing data");
      console.log("acessing data");
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
    console.log("checking friend request length");
    console.log(friendRequestsLength);
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
    console.log("you made it");

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


  return friendRequests && userContext ? (
    <div className="friendsContent">
      <div>
        {friendRequests.length !== 0 ? (
          <ul>
            {friendRequests.map((request, index) => {
              return (
                <li key={index} ref={(el) => (itemRef.current[index] = el)}>
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
                    deny
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <>
            <div>You have no friend Requests</div>
            <div>Wow how sad</div>
          </>
        )}
      </div>
      <div>
        <h1>Frienderinos</h1>
        {friends && (
          <ul className="friendsList">
            {friends.map((friend, index) => {
              return (
                <li className="friend" key={index}>
                  {friend.username}{" "}
                  <Link
                    to={`${process.env.REACT_APP_FRONTEND_URL}/userProfile/${friend.id}`}
                  >
                    Profile Page
                  </Link>
                  <button onClick={() => removeFriend(friend.id)}>
                    Remove Friend
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  ) : (
    <div>You need to log in to view friends</div>
  );
};

export default FriendRequests;
