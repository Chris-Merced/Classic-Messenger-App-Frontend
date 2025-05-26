import React, { useEffect, useContext } from "react";
import { UserContext } from '../context/userContext'

const OAuth = () => {
  const params = new URLSearchParams(window.location.search);
  const user = useContext(UserContext)
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
        document.cookie = "oauth_state=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        window.location.href=`${process.env.REACT_APP_FRONTEND_URL}`
      } else {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/oauth`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(code),
            credentials: 'include'
          }
        );
        document.cookie = "oauth_state=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";


        const data = await response.json()
        console.log(data)
        const newrseposne = await user.oauthLogin(data)
        window.location.href = '/'        
      }
    };
    acquireCode();
  }, []);

  return (
    <>
      <h1></h1>
    </>
  );
};

export default OAuth;
