import React from "react";
import { Link } from "react-router-dom";
import { useState } from "react";


const signUpComponent = () => {
    const [username, setUsername] = useState("");
    const [usernameError, setUsernameError] = useState("");
    const [password, setPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);

    const validatePassword = (password) => {
        if (password === "") {
            return "Please enter in a password";
        }
        return "";
    }

    const validateUsername = (username) => {
        if (username === "") {
            return "Please enter in a username";
        }
        return "";
    }

    const validateEmail = (email) => {
        if (email === "") {
            return "Please enter in an email";
        }
        return "";
    }

    
    const submitHandler = async (e) => {
        e.preventDefault();
        console.log("handler initiated");
        setIsSubmitted(true);

        const passwordErrorMessage = validatePassword(password);
        const usernameErrorMessage = validateUsername(username);
        const emailErrorMessage = validateEmail(email);
        
        setPasswordError(passwordErrorMessage);
        setUsernameError(usernameErrorMessage);
        setEmailError(emailErrorMessage);
        
        if (!passwordError && !usernameError) {
            console.log("signup conditionals met");
            const data = {
                username: username,
                email: email,
                password: password
            };
            try {
                const response = await fetch("http://localhost:3000/signup", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data)

                });
                if (response.ok) {
                    const results = await response.json();
                    console.log("Signup Successful:", results);
                } else {
                    console.error("Signup Failed:", response.status, response.statusText);
                }
                
            } catch (error) {
                console.error("Error during fetch:", error)
            }

        };
    }


    return (
        <div>
            <h1>SignupPage</h1>
            <form onSubmit={submitHandler}>
            
                <div>
                    <label htmlFor="username">Username:</label>
                    <input
                        id="username"
                        maxLength="30"
                        name="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        aria-invalid={usernameError}>
                    </input>
                    {isSubmitted && usernameError && <span>{usernameError}</span>}
                </div>
            
                <div>
                    <label htmlFor="password">Password:</label>
                    <input
                        id="password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        aria-invalid={!!passwordError}>
                    </input>
                    {isSubmitted && passwordError && <span>{passwordError}</span>}
                </div>

                <div>
                    <label htmlFor="email">Email:</label>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        aria-invalid={!!emailError}>
                    </input>
                    {isSubmitted && emailError && <span>{emailError}</span>}

                </div>

                <button type="submit">Assimilate</button>
            </form>
            <Link to='/'>Come Back Home</Link>
        </div>
    )
}


export default signUpComponent;