import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../context/userContext";

const OAuth = () => {
  const params = new URLSearchParams(window.location.search);
  const user = useContext(UserContext);
  const [isSignup, setIsSignup] = useState(false);
  const [signupEmail, setSignupEmail] = useState(null);
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState(null);

  useEffect(() => {
    const acquireCode = async () => {
      const code = { code: params.get("code") };
      const state = params.get("state");

      const cookies = {};
      const cookiesTemp = document.cookie.split(";");
      cookiesTemp.forEach((cookie) => {
        const [name, ...value] = cookie.trim().split("=");
        cookies[name] = value[0];
      });
      console.log(cookies);

      if (state !== cookies.oauth_state) {
        console.error("Mismatching states, aborting OAuth");
        document.cookie =
          "oauth_state=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        window.location.href = `${process.env.REACT_APP_FRONTEND_URL}`;
      } else {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/oauth`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(code),
            credentials: "include",
          }
        );

        document.cookie =
          "oauth_state=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

        const data = await response.json();
        if (data.status === "signup incomplete") {
          console.log("No bueno");
          setIsSignup(true);
          setSignupEmail(data.email);
        } else {
          await user.oauthLogin(data);
          window.location.href = "/";
        }
      }
    };
    acquireCode();
  }, []);

  const oauthSignup = async (e) => {
    e.preventDefault();
    const regex = /^[a-zA-Z0-9]+$/;
    console.log("USERNAME");

    if (username === "") {
      setUsernameError("Please enter in a username");
    } else if (!regex.test(username)) {
      setUsernameError(
        "Please enter in a valid username (One word, can contain numbers)"
      );
    } else {
      console.log("weow");
      setUsernameError(null)
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/oauth/signup`,
        {
          method: "POST",
          credentials: "include",
        }
      );
    }
  };

  return (
    <>
      {isSignup && (
        <form onSubmit={oauthSignup}>
          <h1>Sign Up</h1>
          <div className="oauthEmailSignup">Email: {signupEmail}</div>
          {usernameError && (
            <div className="oauthSignupError">{usernameError}</div>
          )}
          <label htmlFor="username">Username: </label>
          <input
            id="username"
            placeholder="Enter Username"
            value={`${username ? username : ""}`}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button type="submit">Signup</button>
        </form>
      )}
    </>
  );
};

export default OAuth;
