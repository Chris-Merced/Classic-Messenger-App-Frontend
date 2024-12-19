import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './app';
import Header from './components/header';
import { BrowserRouter } from 'react-router-dom';
import { UserProvider } from './context/userContext';
import { WebSocketProvider } from './context/websocketContext';
import { UserChats } from './context/chatListContext';
import './app.css';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <UserProvider>
    <WebSocketProvider>
      <UserChats>
        <BrowserRouter>
          <Header />
          <App />
        </BrowserRouter>
      </UserChats>
    </WebSocketProvider>
  </UserProvider>
);
