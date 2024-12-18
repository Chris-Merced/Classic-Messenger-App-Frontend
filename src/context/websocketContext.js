import React from 'react';
import { createContext, useRef, useEffect, useState } from 'react';

export const WebsocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    socketRef.current = new WebSocket(process.env.REACT_APP_WS_URL);

    socketRef.current.onopen = () => {
      console.log('WebSocket connection opened');
        setIsReady(true);
        //SET REGISTRATION HERE 
      
    };

    socketRef.current.onmessage = (message) => {
      console.log('Message received:', JSON.parse(message.data));
    };

    socketRef.current.onclose = () => {
      console.log('WebSocket connection closed');
    };

    socketRef.current.onerror = (error) => {
      console.error('WebSocket Error:', error);
    };

    return () => {
      socketRef.current.close();
    };
  }, []);

  return isReady ? (
    <WebsocketContext.Provider value={socketRef}>
      {children}
    </WebsocketContext.Provider>
  ) : (
    <div>Loading Websocket..</div>
  );
};
