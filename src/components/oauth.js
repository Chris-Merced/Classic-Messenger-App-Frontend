import React, { useEffect } from "react";

const OAuth = () => {
  const params = new URLSearchParams(window.location.search);

  useEffect(() => {
    const acquireCode = async () => {
      const code = { code: params.get("code") };
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/oauth`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(code),
        }
      );
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
