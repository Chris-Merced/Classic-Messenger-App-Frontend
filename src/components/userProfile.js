import React from "react";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";


const UserProfile = () => {
    const [user, setUser] = useState('');
    const [error, setError] = useState('');
    const { userIdentifier } = useParams();

    useEffect(() => {  
        
        const GetUserProfile = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/userProfile/publicProfile?ID=${userIdentifier}`, {
                    method: "GET",
                    headers: { 'Content-Type': 'application/json' },
                })
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message);
                }

                setUser(data.user);
            

            } catch (err) {
                setError("Error occured on profile retrieval", err)
            }
        }

        GetUserProfile();

        
    }, [userIdentifier])
    
    

    return (<>
        { user ? (<>
            <div>Hello {userIdentifier} ...</div>
            <div>Welcome to the page of {user.username}</div>
            <div>Created at {user.created_at}</div>
            </>
        ) : (
                <div>{error}</div>
        )
        }
    </>
    );
};

export default UserProfile;