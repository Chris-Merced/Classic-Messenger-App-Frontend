import WelcomeHome from './components/home';
import SignUp from './components/signup';
import UserProfile from './components/userProfile';
import React from 'react';
import { Route, Routes } from 'react-router-dom';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<WelcomeHome />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/userProfile/:userIdentifier" element={<UserProfile />} />
    </Routes>
  );
};

export default App;
