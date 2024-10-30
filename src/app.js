import WelcomeHome from "./components/home";
import SignUp from "./components/signup";
import React from "react";
import { Route, Routes } from 'react-router-dom';


const App = () => {
    return (
        <Routes>
            <Route path='/' element={<WelcomeHome />} />
            <Route path='/signup' element={<SignUp />} /> 
        </Routes>
    )
};

export default App;