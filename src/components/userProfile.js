import React from "react";
import { useParams } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { UserContext } from "../context/userContext";
import { UserChatsContext } from "../context/chatListContext";
import { useNavigate } from "react-router-dom";

const UserProfile = () => {
  const [profile, setProfile] = useState("");
  const [error, setError] = useState("");
  const [friendStatus, setFriendStatus] = useState("");
  const { userIdentifier } = useParams();
  const userContext = useContext(UserContext);
  const chatContext = useContext(UserChatsContext);
  const navigate = useNavigate();

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
      console.log("CHECKING FRIEND STATUS");
      console.log(friendStatus);
      setFriendStatus(friendStatus);
    };

    getUserProfile();
    if (userContext?.user?.id) {
      checkIfFriends();
    }
  }, [userIdentifier]);

  const sendDirectMessage = async (userID) => {
    const user = userContext.user;

    const response = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}/conversations?userID=${user.id}&profileID=${profile.id}`
    );
    const data = await response.json();

    if (data.conversation_id) {
      navigate("/");
      chatContext.changeChat({
        name: null,
        conversationID: data.conversation_id,
      });
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
    console.log(newData);
  };

  return (
    <>
      {profile ? (
        <>
          <div>Hello {userIdentifier} ...</div>
          <div>Welcome to the page of {profile.username}</div>
          <div>Created at {profile.created_at}</div>
          <button onClick={() => sendDirectMessage(userContext.user.id)}>
            Direct Message
          </button>
          {!friendStatus ? (
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
