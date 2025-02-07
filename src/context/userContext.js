import React, { createContext, useState, useEffect } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
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
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });

    const newData = await response.json();
    console.log(newData);
    setUser(newData);
    return response;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, loading, error, logout, login }}>
      {children}
    </UserContext.Provider>
  );
};
