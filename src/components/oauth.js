import React from "react";

const OAuth = () => {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  console.log(code);

  return (
    <>
      <h1></h1>
    </>
  );
};

export default OAuth;
