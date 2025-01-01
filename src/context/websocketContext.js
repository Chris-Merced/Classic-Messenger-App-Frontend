import React from 'react';
import { createContext, useRef, useEffect, useState, useContext } from 'react';
import { UserContext } from './userContext';

export const WebsocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [currentUser, setCurrentUser] = useState('');
  const [isReady, setIsReady] = useState(false);

  const user = useContext(UserContext);
  console.log(user);

  useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  
  useEffect(() => {
    
    console.log('WS URL:', process.env.REACT_APP_WS_URL); // Debug log
    
    if (!process.env.REACT_APP_WS_URL) {
      console.error('WebSocket URL is not defined');
      return;
    }
    try{
    socketRef.current = new WebSocket(process.env.REACT_APP_WS_URL);

    socketRef.current.onopen = () => {
      console.log('WebSocket connection opened');
      const registration = {
        registration: true,
      };
      socketRef.current.send(JSON.stringify(registration));
      setIsReady(true);
     
    };
    
    socketRef.current.onmessage = (message) => {
      console.log('Message received at context level:', message);
    };
    socketRef.current.onclose = () => {
      console.log('WebSocket connection closed');
    };

    socketRef.current.onerror = (err) => {
      console.error('WebSocket Error:', err);
    };
  }catch(err){
    console.error("error creating websocket: ", err);
  }
    return () => {
      socketRef.current.close();
    };
  }, [currentUser]);

  return isReady ? (
    <WebsocketContext.Provider value={socketRef}>
      {children}
    </WebsocketContext.Provider>
  ) : (
    <div>Loading Websocket..</div>
  );
};
