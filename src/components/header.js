import React from "react";
import { useEffect, useState } from "react";

const headerComponent = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

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
    
    return (
        <div>
            <h1>Welcome Home</h1>
            <form onSubmit={loginHandler}>
                <label htmlFor="username">Username: </label>
                <input name="username" id="username" value={username} onChange={(e)=>setUsername(e.target.value)}></input>
                <label htmlFor="password">Password: </label>
                <input name="password" id="password" value={password} onChange={(e)=>setPassword(e.target.value)}></input>
                <button type="submit">Log In</button>
            </form>
        </div>

    )
};

export default headerComponent;