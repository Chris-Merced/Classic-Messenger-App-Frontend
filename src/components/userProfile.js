import React from "react";
import { useParams } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { UserContext } from "../context/userContext";
import { UserChatsContext } from "../context/chatListContext";
import { useNavigate } from "react-router-dom";

const UserProfile = () => {
  const [profile, setProfile] = useState("");
  const [error, setError] = useState("");
  const [isBlocked, setIsBlocked] = useState("");
  const [blockedByProfile, setBlockedByProfile] = useState("");
  const [friendStatus, setFriendStatus] = useState("");
  const { userIdentifier } = useParams();
  const userContext = useContext(UserContext);
  const chatContext = useContext(UserChatsContext);
  const navigate = useNavigate();


  //NEED TO CONTINUE TO IMPLEMENT BLOCK FUNCTIONALITY
  //THE BLOCK FUNCTIONALITY SHOULD DISALLOW USERS FROM SENDING MESSAGES AT ALL VIA WEBSOCKET
  //IF THEY HAVE BEEN BLOCKED


  useEffect(() => {
    const getUserProfile = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/userProfile/publicProfile?ID=${userIdentifier}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message);
        }

        setProfile(data.user);
      } catch (err) {
        setError("Error occured on profile retrieval", err);
      }
    };

    const checkIfFriends = async () => {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/userProfile/checkIfFriends?userID=${userContext.user.id}&friendID=${userIdentifier}`
      );
      const friendStatus = await response.json();
      setFriendStatus(friendStatus.friendStatus);
    };

    const checkIfBlocked = async () => {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/userProfile/checkIfBlocked?userID=${userContext.user.id}&blockedID=${userIdentifier}`
      );
      const data = await response.json();
      setIsBlocked(data.isBlocked);
    };

    getUserProfile();
    if (userContext?.user?.id) {
      checkIfFriends();
      checkIfBlocked();
    }
  }, [userIdentifier, isBlocked]);

  useEffect(() => {
    const checkIfBlockedByProfile = async () => {
      if (userContext?.user?.id) {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/userProfile/blockedByProfile?userID=${userContext.user.id}&profileID=${userIdentifier}`
        );
        const data = await response.json();
        setBlockedByProfile(data);
      }
    };
    checkIfBlockedByProfile();
  }, [userIdentifier]);

  const sendDirectMessage = async (userID) => {
    const user = userContext.user;

    const response = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}/conversations?userID=${user.id}&profileID=${profile.id}`
    );
    const data = await response.json();

    if (data.conversation_id) {
      chatContext.changeChat({
        name: null,
        conversationID: data.conversation_id,
      });
      navigate("/");
    }
  };

  const sendFriendRequest = async () => {
    const data = {
      userID: userContext.user.id,
      profileID: userIdentifier,
    };

    const response = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}/userProfile/friendRequest`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      }
    );

    const newData = await response.json();
  };

  const blockUser = async () => {
    const user = userContext.user;

    const body = { userID: user.id, blockedID: userIdentifier };
    const response = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}/userProfile/blockUser`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );
    const data = await response.json();
    setIsBlocked(true);
  };

  const unblockUser = async () => {
    const body = { userID: userContext.user.id, unblockedID: userIdentifier };

    const response = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}/userProfile/unblockUser`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );
    const data = await response.json();
    setIsBlocked(false);
  };

  return (
    <>
      {profile ? (
        <>
          <div>Hello {userIdentifier} ...</div>
          <div>Welcome to the page of {profile.username}</div>
          <div>Created at {profile.created_at}</div>
          {blockedByProfile ? (
            <div>You Are Currently Blocked by This User</div>
          ) : (
            <button onClick={() => sendDirectMessage(userContext.user.id)}>
              Direct Message
            </button>
          )}
          {isBlocked === false ? (
            <button onClick={blockUser}>Block</button>
          ) : (
            <button onClick={unblockUser}>Unblock</button>
          )}
          {friendStatus === false ? (
            <button onClick={sendFriendRequest}>Send Friend Request</button>
          ) : (
            <></>
          )}
        </> //MAKE GET FETCH TO CHECK IF PUBLIC OR PRIVATE AND HAVE DM APPEAR ONLY
      ) : (
        ////IF PUBLIC, OR PRIVATE AND FRIENDS
        <div>{error}</div>
      )}
    </>
  );
};

export default UserProfile;
