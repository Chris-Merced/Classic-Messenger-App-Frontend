import React from "react";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../context/userContext";


//get the website ready for heroku deployment
//Clean up the visual component of the website
//set up the database to handle messages so that the last 12 messages are displayed
//look into getting rid of the flicker on page refresh for the username and password fields

const WebSocketComponent = () => {
    const[message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [user, setUser] = useState('');

    const context = useContext(UserContext);
    const userData = context.user;
    const socketRef = useRef(null);
    
    useEffect(() => {
        setUser(userData);
   }, [userData])
    
    useEffect(() => { 
        socketRef.current = new WebSocket("ws://localhost:3000")

        socketRef.current.onopen = () => {
            console.log("Connection Open");
        };

        socketRef.current.onmessage = (message) => {
            message = JSON.parse(message.data);
            console.log(message);
            message = {
                ...message, time: new Date(message.time).toLocaleString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
            })};
            console.log(message);
            setMessages((prevMessages) => [...prevMessages, message]);
            console.log(messages);
        };

        socketRef.current.onclose = () => {
            console.log("connection closed");
        };

        socketRef.current.onerror = (error) => {
            console.error("WebSocket Error:", error);
        };

        return () => {
            socketRef.current.close();
        }
    }, [])

    const sendMessage = (e) => {
        e.preventDefault();
        const data = {
            message: message,
            user: user.username,
            time: new Date().toISOString(),
        }
        const newdata = new Date(data.time).toLocaleString();
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify(data));
            setMessage("");
        }
        else { console.log("console is not open") }
    }

    return (
        <>
            <ul className="MessageList">
                {messages.map((message, index) => (
                    <li className="message" key={index}>
                        <div className="time">{message.time}</div>
                        <div className="username">{message.user}:  </div>
                        <div>{message.message}</div>
                    </li>
                ))}
            </ul>
            { user  && <>
                <form>
                    <input type="text" onChange={(e) => setMessage(e.target.value)} value={message}></input>
                    <button onClick={sendMessage}>Send Message</button>
                </form>
                </>
            }
        </>
    );
}
export default WebSocketComponent;