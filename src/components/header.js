import React from "react";
import { useEffect, useState, useContext } from "react";
import { UserContext } from "../context/userContext";


//FIND OUT HOW TO CAUSE AUTOMATIC PAGE REFRESH ON LOGOUT

const headerComponent = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [dropDown, setDropDown] = useState(false);

    const context = useContext(UserContext);
    const userData = context.user;
    
    const isDropDown = () => {
        if (dropDown === false) {
            setDropDown(true);
        } else { setDropDown(false) }
    }

    const logout = async () => {
        try {
            const response = await fetch('http://localhost:3000/logout', {
                method: "DELETE",
                credentials: 'include'
            })

            const data = await response.json();
        } catch (err) {
            console.log("Error with fetch: ", err);
        }
    }

    const loginHandler = async (e) => {
        e.preventDefault();
        
        const data = {
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

    return (
        <div>
            <h1>Welcome Home</h1>
            {userData ? (<><div> Hello {userData.username}</div>
                <div className="DropDown">
                    <button onClick={isDropDown}>Drop-Down</button>
                    {dropDown && <div className="Menu">
                        <div>Hellow world</div>
                        <button className="logout" onClick={logout}>Log Out</button>
                    </div>}
                </div>
            </>) : (
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