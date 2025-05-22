import WelcomeHome from "./components/home";
import SignUp from "./components/signup";
import UserProfile from "./components/userProfile";
import FriendRequests from "./components/friends";
import OAuth from "./components/oauth"
import React from "react";
import { Route, Routes } from "react-router-dom";



const App = () => {
  return (
    <Routes>
      <Route path="/" element={<WelcomeHome />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/userProfile/:userIdentifier" element={<UserProfile />} />
      <Route path="/userProfile/friends" element={<FriendRequests/>}/>
      <Route path="/oauth" element={<OAuth />}/>
    </Routes>
  );
};

export default App;
