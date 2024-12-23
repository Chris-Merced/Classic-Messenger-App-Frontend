import React from 'react';
import { useParams } from 'react-router-dom';
import { useEffect, useState, useContext } from 'react';
import { UserContext } from '../context/userContext';
import { UserChatsContext } from '../context/chatListContext';

const UserProfile = () => {
  const [profile, setProfile] = useState('');
  const [error, setError] = useState('');
  const { userIdentifier } = useParams();
  const userContext = useContext(UserContext);

  useEffect(() => {
    const GetUserProfile = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/userProfile/publicProfile?ID=${userIdentifier}`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          }
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message);
        }

        setProfile(data.user);
      } catch (err) {
        setError('Error occured on profile retrieval', err);
      }
    };

    GetUserProfile();
  }, [userIdentifier]);

  const sendDirectMessage = (userID) =>{
    //CREATE FETCH FOR THE BACKEND
    //THE BACKEND ROUTE WILL BE TO CHECK IF THERE IS A CONVERSATION BETWEEN
    //THE USER AND THE PROFILEUSER
    //IF THERE IS, RETURN YES AND CHANGE CHAT TO THAT USER AND THEN REDIRECT TO MAIN
    //OTHERWISE CREATE CHAT IN DB, SET CHAT, AND REDIRECT
    
    console.log("it works" + userID);
  }

  return (
    <>
      {profile ? (
        <>
          <div>Hello {userIdentifier} ...</div>
          <div>Welcome to the page of {profile.username}</div>
          <div>Created at {profile.created_at}</div>
          <button onClick={() => sendDirectMessage(userContext.user.id)}>Direct Message</button>
        </>
      ) : (
        <div>{error}</div>
      )}
    </>
  );
};

export default UserProfile;
