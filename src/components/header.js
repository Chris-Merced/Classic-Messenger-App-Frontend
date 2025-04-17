import React from "react";
import { useEffect, useState, useContext } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { UserContext } from "../context/userContext";
import { UserChatsContext } from "../context/chatListContext";
import { Link, useLocation } from "react-router-dom";

//clean up the visual elements of the sidebar chat search functionality
//begin to implement user profile editing

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
  const navigate = useNavigate();

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
      navigate("/");
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
      console.log("CHECKING USER SEARCH DATA: ");
      console.log(users);
      setUsers(users);
    }
    if (username === "") {
      setUsers([]);
    }
  };

  const sendUserToProfilePageSearch = (e, username) => {
    for (let i = 0; i < users.length; i++) {
      if (users[i].username === username) {
        setSearchInput("");
        navigate(`/userProfile/${users[i].id}`);
      }
    }
  };

  return (
    <>
      <div className="websiteHeader">
        <Link to="/" className="homepageLink">
          <h1 className="welcomeHeader">
            <span>Welcome</span> <strong>Home</strong>
          </h1>
        </Link>
        {user && (
          <div className="interactionComponents">
            <div className="searchComponent">
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
                      setTimeout(() => {
                        setSearchInput("");
                        searchDB(e, username);
                      }, 150);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        sendUserToProfilePageSearch(e, e.target.value);
                      }
                    }}
                  ></input>
                </form>
              </div>
              {searchInput && (
                <ul className="searchResults">
                  {users.map((user, index) => (
                    <li className="searchOption" key={index}>
                      <Link to={`/userProfile/${user.id}`}>
                        <button className="userListItem">
                          {user.username}
                        </button>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="userProfile">
              <div className="profileName">
                {friendRequests.length !== 0 ? (
                  <div className="notifications">!</div>
                ) : (
                  <span></span>
                )}
              </div>

              <div className="DropDown">
                <button className="dropdownButton" onClick={isDropDown}>
                  <div>{user.username}</div>
                  {dropDown ? <div>▲</div> : <div>▼</div>}
                </button>
                <div className={`Menu ${dropDown ? "show" : "hide"}`}>
                  <div className="profile menu-item">
                    <Link to={`/userProfile/${user.id}`}>
                      <button className="profileButton" onClick={isDropDown}>
                        Profile
                      </button>
                    </Link>
                  </div>
                  <div className="friends menu-item">
                    <Link to={`/userProfile/friends`} className="friendsLink">
                      <button className="friendsButton" onClick={isDropDown}>
                        Friends
                      </button>
                    </Link>
                    {friendRequests.length !== 0 && (
                      <div className="notifications friendRequestNotifications">
                        {friendRequests?.length}
                      </div>
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
        )}{" "}
        {!user && (
          <button onClick={toggleTheme} className="themeToggle noUser">
            {isLightTheme ? "🌙" : "☀️"}
          </button>
        )}
      </div>
      {!user && location.pathname !== "/signup" && (
        <div className="loginHeader">
          <form className="loginForm" onSubmit={loginHandler}>
            <div className="usernameForm">
              <label htmlFor="username">Username: </label>
              <input
                className="usernameInput"
                name="username"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              ></input>
            </div>
            <div className="passwordForm">
              <label htmlFor="password">Password: </label>
              <input
                className="passwordInput"
                name="password"
                id="password"
                type="password"
                onChange={(e) => setPassword(e.target.value)}
              ></input>
            </div>
            <button className="loginButton" type="submit">
              Log In
            </button>
            <Link to="/signup" className="signup">
              Signup
            </Link>
          </form>
        </div>
      )}
    </>
  );
};

export default HeaderComponent;
