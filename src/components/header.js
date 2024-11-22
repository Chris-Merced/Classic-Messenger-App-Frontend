import React from "react";
import { useEffect, useState, useContext } from "react";
import { UserContext } from "../context/userContext";

//Clean up all environment variables, ensure that 

const headerComponent = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [dropDown, setDropDown] = useState(false);
    const [user, setUser] = useState("");
    
    const context = useContext(UserContext);
    const userData = context.user;
    
    useEffect(() => {
        setUser(userData)
    }, [userData])

    const isDropDown = () => {
        if (dropDown === false) {
            setDropDown(true);
        } else { setDropDown(false) }
    }

    const logoutHandler = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/logout`, {
                method: "DELETE",
                credentials: 'include'
            })

            const data = await response.json();
            context.logout();
            setUser('');
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

        const response = await context.login(data);
        
        setPassword('');
        setUsername('');

    }

    return (
        <div>
            <h1>Welcome Home</h1>
            {user ? (<><div> Hello {user.username}</div>
                <div className="DropDown">
                    <button onClick={isDropDown}>Drop-Down</button>
                    {dropDown && 
                    <div className="Menu">
                        <div>User Menu: </div>
                        <button className="logout" onClick={logoutHandler}>Log Out</button>
                    </div>}
                </div>
            </>) : (
                <form onSubmit={loginHandler}>
                    <label htmlFor="username">Username: </label>
                    <input name="username" id="username" value={username} onChange={(e) => setUsername(e.target.value)}></input>
                    <label htmlFor="password">Password: </label>
                    <input name="password" id="password" type="password" onChange={(e) => setPassword(e.target.value)}></input>
                    <button type="submit">Log In</button>
                </form>
            )}
        </div>

    )
};

export default headerComponent;