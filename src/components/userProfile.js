import React from "react";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";


const UserProfile = () => {
    const [user, setUser] = useState('');

    const { userID } = useParams();

    useEffect(()=> {
        const GetUserProfile = async () => {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/userProfile/publicProfile?ID=${userID}`, {
                method: "GET",
                headers: { 'Content-Type': 'application/json' },
            })
            const data = await response.json();
            setUser(data.user);
        }

        GetUserProfile();
    }, [])


    return (
        <>
        <div>Hello {userID} ...</div>
        <div>Welcome to the page of {user.username}</div>
        <div>Created at {user.created_at}</div>
        </>
    );
};

export default UserProfile;