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

  const sendDirectMessage = async (userID) => {
    //CREATE FETCH FOR THE BACKEND
    const user = userContext.user;
    console.log(user);
    console.log(profile);
    console.log(user.name, profile.name)
    const response = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}/conversations?userID=${user.id}&profileID=${profile.id}`
    );
    //CHANGE CHAT TO THAT USER WITH NAME AS NULL AND THEN REDIRECT TO MAIN
    

    console.log('it works' + userID);
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
        </>
      ) : (
        <div>{error}</div>
      )}
    </>
  );
};

export default UserProfile;
