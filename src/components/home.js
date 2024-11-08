import React from "react";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const WebSocketComponent = () => {
    const[message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const socketRef = useRef(null);
    
    useEffect(() => {
        socketRef.current = new WebSocket("ws://localhost:3000")

        socketRef.current.onopen = () => {
            console.log("Connection Open");
        };

        socketRef.current.onmessage = (message) => {
            console.log("message recieved");
            setMessages((prevMessages) => [...prevMessages, message.data]);
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
        console.log(message);
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(message);
            setMessage("");
        }
        else { console.log("console is not open") }
    }

    return (
        <>
            <ul>
                {messages.map((message, index) => (
                    <li key={index}>{message}</li>
                ))}
            </ul>
            <form>
                <input type="text" onChange={(e) => setMessage(e.target.value)} value={message}></input>
                <button onClick={sendMessage}>Send Message</button>
            </form>
            <Link to="/signup">Go To Signup</Link>
        </>
    );
}
export default WebSocketComponent;