import WelcomeHome from "./components/home";
import SignUp from "./components/signup";
import UserProfile from "./components/userProfile";
import FriendRequests from "./components/friendRequests";
import React from "react";
import { Route, Routes } from "react-router-dom";

//CREATE A FRIEND REQUEST PAGE TO SHOW FRIEND REQUEST INFORMATION
//MAKE SURE TO LINK FROM SIDE DROP DOWN MENU


const App = () => {
  return (
    <Routes>
      <Route path="/" element={<WelcomeHome />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/userProfile/:userIdentifier" element={<UserProfile />} />
      <Route path="/userProfile/friendRequests" element={<FriendRequests/>}/>
    </Routes>
  );
};

export default App;
