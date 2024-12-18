import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './app';
import Header from './components/header';
import { BrowserRouter } from 'react-router-dom';
import { UserProvider } from './context/userContext';
import { WebSocketProvider } from './context/websocketContext';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <UserProvider>
    <WebSocketProvider>
      <BrowserRouter>
        <Header />
        <App />
      </BrowserRouter>
    </WebSocketProvider>
  </UserProvider>
);
