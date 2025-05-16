import React from "react";
import { Link } from "react-router-dom";
import { useState } from "react";

const signUpComponent = () => {
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  const validatePassword = (password) => {
    if (password === "") {
      return "Please enter in a password";
    }
    if(password !== passwordConfirm){
      return "Passwords do not match"
    }
    return "";
  };

  const validateUsername = (username) => {
    const regex = /^[a-zA-Z0-9]+$/;
    if (username === "") {
      return "Please enter in a username";
    }
    if (!regex.test(username)) {
      return "Please enter in a valid username (One word, can contain numbers)";
    }
    return "";
  };

  const validateEmail = (email) => {
    if (email === "") {
      return "Please enter in an email";
    }
    return "";
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    console.log("Signup form submitted");
    console.log("handler initiated");
    setIsSubmitted(true);

    const passwordErrorMessage = validatePassword(password);
    const usernameErrorMessage = validateUsername(username);
    const emailErrorMessage = validateEmail(email);

    setPasswordError(passwordErrorMessage);
    setUsernameError(usernameErrorMessage);
    setEmailError(emailErrorMessage);

    if (!passwordErrorMessage && !usernameErrorMessage) {
      console.log("signup conditionals met");
      const data = {
        username: username,
        email: email,
        password: password,
      };
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/signup`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          }
        );
        if (response.ok) {
          const results = await response.json();
          setSignupSuccess(true);
          console.log("Signup Successful:", results);
        } else {
          const results = await response.json();
          console.error("Signup Failed:", response.status, response.statusText);
          setServerError(results.message);
        }
      } catch (error) {
        console.error("Error during fetch:", error);
      }
    }
  };

  return (
    <div className="signupComponent">
      <h1 id="signup-header" className="signupHeader">Sign Up</h1>
      {signupSuccess ? (
        <div role="status" aria-live="polite">Welcome to the Family</div>
      ) : (
        <form
          className="signupForm"
          onSubmit={submitHandler}
          role="form"
          aria-labelledby="signup-header"
        >
          <div className="field">
            {serverError && (
              <div role="alert" aria-live="assertive">{serverError}</div>
            )}
            <label htmlFor="username">Username:</label>
            <input
              className="signupInput"
              id="username"
              name="username"
              maxLength="30"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              aria-required="true"
              aria-invalid={!!usernameError}
              aria-describedby="username-error"
            />
            {isSubmitted && usernameError && (
              <span id="username-error" role="alert">{usernameError}</span>
            )}
          </div>

          <div className="field">
            <label htmlFor="password">Password:</label>
            <input
              className="signupInput"
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-required="true"
              aria-invalid={!!passwordError}
              aria-describedby="password-error"
            />
            {isSubmitted && passwordError && (
              <span id="password-error" role="alert">{passwordError}</span>
            )}
          </div>

          <div className="field">
            <label htmlFor="passwordConfirm">Confirm Password:</label>
            <input
              className="signupInput"
              id="passwordConfirm"
              name="passwordConfirm"
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              aria-required="true"
            />
          </div>

          <div className="field">
            <label htmlFor="email">Email:</label>
            <input
              className="signupInput"
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-required="true"
              aria-invalid={!!emailError}
              aria-describedby="email-error"
            />
            {isSubmitted && emailError && (
              <span id="email-error" role="alert">{emailError}</span>
            )}
          </div>

          <button className="assimilateButton" type="submit" aria-label="Submit sign up form">
            Assimilate
          </button>
        </form>
      )}
      <Link to="/" className="signup" aria-label="Return to home page">
        Come Back Home
      </Link>
    </div>
  );
};

export default signUpComponent;
