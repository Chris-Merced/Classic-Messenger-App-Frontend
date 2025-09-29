import React from "react";
import { useContext, useState } from "react";
import { UserContext } from "../context/userContext";

function AdminPanel() {
  const userContext = useContext(UserContext).user;
  const [usernameError, setUsernameError] = useState("");
  const [daysError, setDaysError] = useState("");
  const [banSuccess, setBanSuccess] = useState(false);

  async function handleBan(e) {
    e.preventDefault();
    console.log("username: ");
    console.log(e.target.username.value);
    console.log("days: ");
    console.log(e.target.days.value);

    const username = e.target.username.value;
    const days = e.target.days.value;
    let error = false

    if (days === "perm") {
      //perm ban
    } else {
      const ver = parseInt(days.trim());
      if (ver) {
        console.log("Thats a number");
        setDaysError("");
      } else {
        setDaysError("Invalid Input: Enter integer or 'perm' ");
        error=true;
      }
    }

    if (!error) {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/admin/ban?username=${username}&days=${days.trim()}`,
        {
          credentials: "include",
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!res.ok) {
      } else {
        const data = await res.json()
        console.log(data)
        console.log("Successful ban");
        setBanSuccess(true);
        setTimeout(() => {
          setBanSuccess(false);
        }, 5000);
      }
      
    }
  }

  return userContext ? (
    <div>
      {userContext.is_admin ? (
        <>
          <header className="banHeader">Ban Form</header>
          <form className="banForm" onSubmit={handleBan}>
            <div className="banFormRow">
              <label htmlFor="username">Username: </label>
              <input className="usernameInput" id="username"></input>
            </div>
            <div className="formError">{usernameError}</div>

            <div className="banFormRow">
              <label htmlFor="banFormInput">Days: </label>
              <input className="banFormInput" id="days"></input>
            </div>
            {daysError && <div className="formError">{daysError}</div>}
            <button className="banButton" type="submit">
              Click me
            </button>
          </form>
          {banSuccess && (
            <div className="banSuccess">User Banned Successfully!</div>
          )}
        </>
      ) : (
        <div>You do not have permissions to view this page</div>
      )}
    </div>
  ) : (
    <>Loading</>
  );
}

export default AdminPanel;
