import React, { createContext, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const hasInitializedRef = useRef(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/userProfile`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Unauthorized or session expired");
        }

        const data = await response.json();
        setUser(data.user);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const login = async (data) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
          credentials: "include",
        }
      );

      const newData = await response.json();
      console.log(response);
      if (response.ok) {
        setUser(newData);
      } else {
        console.log(newData.message);
      }

      return response;
    } catch (err) {
      console.log("Error while attempting to log in user: \n" + err);
    }
  };

  const oauthLogin = async (data) => {
    setUser(data);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <UserContext.Provider
      value={{
        hasInitializedRef,
        user,
        loading,
        error,
        logout,
        login,
        oauthLogin,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
