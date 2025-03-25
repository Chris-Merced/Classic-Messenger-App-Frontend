import React from "react";
import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/userContext";
import { UserChatsContext } from "../context/chatListContext";
import { Link, useLocation } from "react-router-dom";

const HeaderComponent = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [dropDown, setDropDown] = useState(false);
  const [user, setUser] = useState("");
  const [users, setUsers] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [friendRequests, setFriendRequests] = useState("");
  const [isLightTheme, setIsLightTheme] = useState(false);

  const context = useContext(UserContext);
  const chatContext = useContext(UserChatsContext);
  const userData = context.user;
  const location = useLocation();

  useEffect(() => {
    setUser(userData);

    const getUserFriendRequests = async () => {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/userProfile/friendRequest?userID=${context.user.id}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const friendRequestData = await response.json();
      const friendRequestsJSON = JSON.stringify(
        friendRequestData.friendRequests
      );

      setFriendRequests(friendRequestData.friendRequests);
    };
    if (userData) {
      getUserFriendRequests();
    }
  }, [userData]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
      document.body.classList.add("light-theme");
      setIsLightTheme(true);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = isLightTheme ? "dark" : "light";

    document.body.classList.toggle("light-theme", !isLightTheme);
    localStorage.setItem("theme", newTheme);
    setIsLightTheme(!isLightTheme);
  };

  const isDropDown = () => {
    setDropDown((prev) => !prev);
    console.log("Dropdown state: " + !dropDown);
  };

  const logoutHandler = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/logout`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      context.logout();
      chatContext.resetChatList();
      setUser("");
      window.location.reload();
    } catch (err) {
      console.log("Error with fetch: ", err);
    }
  };

  const loginHandler = async (e) => {
    e.preventDefault();

    const data = {
      username: username,
      password: password,
    };

    const response = await context.login(data);

    setPassword("");
    setUsername("");
    window.location.reload();
  };

  const searchDB = async (e, username) => {
    e.preventDefault();
    if (username !== "") {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/userProfile/usersBySearch?username=${username}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = await response.json();
      const users = data.users;

      setUsers(users);
    }
    if (username === "") {
      setUsers([]);
    }
  };

  return (
    <div className="websiteHeader">
      <Link to="/" className="homepageLink">
        <h1>Welcome Home</h1>
      </Link>
      {user ? (
        <div className="interactionComponents">
          <div className="searchBar">
            <form onSubmit={searchDB}>
              <input
                type="text"
                name="search"
                id="search"
                placeholder="Search Users"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  const username = e.target.value;
                  searchDB(e, username);
                }}
                onBlur={(e) => {
                  setSearchInput("");
                  searchDB(e, username);
                }}
              ></input>
              {searchInput && (
                <ul className="searchResults">
                  {users.map((user, index) => (
                    <li className="searchOption" key={index}>
                      <Link to={`/userProfile/${user.id}`}>
                        {user.username}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </form>
          </div>

          <div className="userProfile">
            <div className="profileName">
              {friendRequests.length !== 0 ? (
                <div className="notifications">{friendRequests?.length}</div>
              ) : (
                <span></span>
              )}
            </div>

            <div className="DropDown">
              <button className="profileButton" onClick={isDropDown}>
                <div>{user.username}</div>
                {dropDown ? <div>▲</div> : <div>▼</div>}
              </button>
              <div className={`Menu ${dropDown ? "show" : "hide"}`}>
                <div className="friends menu-item">
                  <Link to={`/userProfile/friends`}><button className="friendsButton" onClick={isDropDown}>Friends</button></Link>
                  {friendRequests.length !== 0 ? (
                    <div className="friendRequestNotifications">
                      {friendRequests?.length}
                    </div>
                  ) : (
                    <span></span>
                  )}
                </div>
                <button className="logout menu-item" onClick={logoutHandler}>
                  Log Out
                </button>
              </div>
            </div>
            <button onClick={toggleTheme} className="themeToggle">
              {isLightTheme ? "🌙" : "☀️"}
            </button>
          </div>
        </div>
      ) : (
        location.pathname !== "/signup" && (
          <>
            <form onSubmit={loginHandler}>
              <label htmlFor="username">Username: </label>
              <input
                name="username"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              ></input>
              <label htmlFor="password">Password: </label>
              <input
                name="password"
                id="password"
                type="password"
                onChange={(e) => setPassword(e.target.value)}
              ></input>
              <button type="submit">Log In</button>
            </form>

            <Link to="/signup" className="signup">
              Go To Signup
            </Link>
          </>
        )
      )}
    </div>
  );
};

export default HeaderComponent;
