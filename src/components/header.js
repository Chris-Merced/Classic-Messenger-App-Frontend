import React from "react";
import { useEffect, useState, useContext } from "react";
import { UserContext } from "../context/userContext";


//NEED TO SET LOG OUT FUNCTION NEXT

const headerComponent = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const context = useContext(UserContext);
    const userData = context.user;
    

    const loginHandler = async (e) => {
        e.preventDefault();
        const data =  {
            username: username,
            password: password
        }
        
        const response = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
            credentials:'include'
        });

        const newData = await response.json();
        if (newData) {
            console.log(newData.message);
        } else {console.log("no data recieved")}

    }

    useEffect(() => {     
    }, [])
    
    if (userData?.error) {
        console.log("Error occured in authentication", userData?.error)
    }

    return (
        <div>
            <h1>Welcome Home</h1>
            {userData ? (<div> Hello {userData.username}</div>) : (
                <form onSubmit={loginHandler}>
                    <label htmlFor="username">Username: </label>
                    <input name="username" id="username" value={username} onChange={(e) => setUsername(e.target.value)}></input>
                    <label htmlFor="password">Password: </label>
                    <input name="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)}></input>
                    <button type="submit">Log In</button>
                </form>
            )}
        </div>

    )
};

export default headerComponent;