import React from "react";
import { useContext, useState } from "react";
import { UserContext } from "../context/userContext";

function AdminPanel() {
  const userContext = useContext(UserContext).user;

  const [banUsernameError, setBanUsernameError] = useState("");
  const [daysError, setDaysError] = useState("");
  const [banSuccess, setBanSuccess] = useState(false);
  const [banError, setBanError] = useState(false);

  const [unbanUsernameError, setUnbanUsernameError] = useState("");
  const [unbanSuccess, setUnbanSuccess] = useState(false);
  const [unbanError, setUnbanError] = useState(false);

  const [adminError, setAdminError] = useState(false);
  const [adminUsernameError, setAdminUsernameError] = useState(false);
  const [adminSuccess, setAdminSuccess] = useState(false);

  async function handleBan(e) {
    e.preventDefault();
    console.log("username: ");
    console.log(e.target.username.value);
    console.log("days: ");
    console.log(e.target.days.value);

    const username = e.target.username.value;
    const days = e.target.days.value;
    let error = false;

    if (days === "perm") {
      //perm ban
    } else {
      const ver = parseInt(days.trim());
      if (ver) {
        console.log("Thats a number");
        setDaysError("");
      } else {
        setDaysError("Invalid Input: Enter integer or 'perm' ");
        error = true;
      }
    }

    if (!error) {
      const res = await fetch(
        `${
          process.env.REACT_APP_BACKEND_URL
        }/admin/ban?username=${username}&days=${days.trim()}`,
        {
          credentials: "include",
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );
      const response = await res.json();

      if (!res.ok) {
        console.log(response.error);
        setBanError(true);
      } else {
        const data = await res.json();
        console.log(data);
        console.log("Successful ban");
        setBanError(false);
        setBanSuccess(true);
        setTimeout(() => {
          setBanSuccess(false);
        }, 5000);
      }
    }
  }

  async function handleUnban(e) {
    e.preventDefault();
    const username = e.target.username.value;
    if (typeof username !== "string" || username.length > 16 || !username) {
      setUnbanUsernameError(true);
      return;
    }
    const data = { username: username };
    const res = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}/admin/unban`,
      {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    );

    const response = await res.json();

    if (res.ok) {
      setUnbanError(false);
      setUnbanSuccess(true);
      setBanUsernameError(false);
      setTimeout(() => {
        setUnbanSuccess(false);
      }, 5000);

      console.log(response.message);
    } else {
      console.log(response.error);
      setUnbanError(true);
    }
  }

  async function handleMakeAdmin(e) {
    e.preventDefault();

    const username = e.target.username.value;
    
    if (typeof username !== "string" || username.length > 16 || !username) {
      setAdminError(true);
      return;
    }

    const data = { username: username };

    const res = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}/admin/adminStatus`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      }
    );

    const response = await res.json();

    if (res.ok) {
      setAdminError(false);
      setAdminUsernameError(false);
      setAdminSuccess(true);
      setTimeout(() => {
        setAdminSuccess(false);
      }, 5000);
      console.log(response.message);
    } else {
      console.log(response.error);
      setAdminError(true);
    }
  }

  return userContext ? (
    <div>
      {userContext.is_admin ? (
        <>
          <header className="banHeader">Ban Form</header>
          <form className="banForm" onSubmit={handleBan}>
            <div className="banFormRow">
              {banError && (
                <div>Could not ban user, check console and try again</div>
              )}
              <label htmlFor="username">Username: </label>
              <input className="usernameInput" id="username"></input>
            </div>
            <div className="formError">{banUsernameError}</div>

            <div className="banFormRow">
              <label htmlFor="banFormInput">Days: </label>
              <input className="banFormInput" id="days"></input>
            </div>
            {daysError && <div className="formError">{daysError}</div>}
            <button className="banButton" type="submit">
              Ban
            </button>
          </form>
          {banSuccess && (
            <div className="banSuccess">User Banned Successfully!</div>
          )}

          <header className="banHeader">Unban Form</header>
          {unbanError && (
            <div>Could not unban user, check console and try again</div>
          )}
          <form className="banForm" onSubmit={handleUnban}>
            <div className="banFormRow">
              <label htmlFor="username">Username: </label>
              <input className="usernameInput" id="username"></input>
            </div>
            {unbanUsernameError && <div>Invalid Username input</div>}
            <button className="banButton" type="submit">
              Unban
            </button>
          </form>
          {unbanSuccess && (
            <div className="banSuccess">User Unbanned Successfully!</div>
          )}

          <header className="banHeader">Make Admin Form</header>
          {adminError && (
            <div>Could not make Admin, check console and try again</div>
          )}
          <form className="banForm" onSubmit={handleMakeAdmin}>
            <div className="banFormRow">
              <label htmlFor="username">Username: </label>
              <input className="usernameInput" id="username"></input>
            </div>
            {adminUsernameError && <div>Invalid Username input</div>}
            <button className="banButton" type="submit">
              Unban
            </button>
          </form>
          {adminSuccess && <div className="banSuccess">User Made Admin!</div>}
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
