import React from "react";
import { Link } from "react-router-dom";
//set Up Basic routing functionality
//
//Need to set up sign up functionality via a form submissiom
//to interact with the backend
//once the backend connection has been established we sanitize with error messages

const signUpComponent = () => {
    return (
        <div>
            <h1>SignupPage</h1>
            <Link to='/'>Come Back Home</Link>
        </div>
    )
}

export default signUpComponent;