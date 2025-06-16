import React from "react";
import {
  useEffect,
  useState,
  useContext,
  useRef,
  useLayoutEffect,
} from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { UserContext } from "../context/userContext";
import { UserChatsContext } from "../context/chatListContext";
import { Link, useLocation } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

const HeaderComponent = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [dropDown, setDropDown] = useState(false);
  const [user, setUser] = useState("");
  const [users, setUsers] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [friendRequests, setFriendRequests] = useState("");
  const [isLightTheme, setIsLightTheme] = useState(false);
  const [loginError, setLoginError] = useState(null);
  const windowWidth = useRef();
  const pageRef = useRef(0);
  const searchRef = useRef(null);

  const context = useContext(UserContext);
  const chatContext = useContext(UserChatsContext);
  const userData = context.user;
  const location = useLocation();
  const navigate = useNavigate();

  windowWidth.current = window.innerWidth;

  useEffect(() => {
    if (userData) {
      setUser(userData);
    }

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

  useLayoutEffect(() => {
    if (!searchRef.current) {
      return;
    }

    const container = searchRef.current;

    const scrollHandle = async () => {
      if (
        container.scrollTop + container.clientHeight >=
        container.scrollHeight
      ) {
        pageRef.current += 1;
        const onScroll = true;
        searchDB(null, searchInput, onScroll);
      }
    };

    container.addEventListener("scroll", scrollHandle);
    return () => container.removeEventListener("scroll", scrollHandle);
  }, [searchRef.current]);

  const toggleTheme = () => {
    const newTheme = isLightTheme ? "dark" : "light";

    document.body.classList.toggle("light-theme", !isLightTheme);
    localStorage.setItem("theme", newTheme);
    setIsLightTheme(!isLightTheme);
  };

  const isDropDown = () => {
    setDropDown((prev) => !prev);
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

    if (!username && !password) {
      console.log("No username or password submitted");
      setLoginError("Please provide a value for username and password");
      return;
    }
    if (!username) {
      console.log("No username submitted");
      setLoginError("Please provide a value for username");
      return;
    }
    if (!password) {
      console.log("No password submitted");
      setLoginError("Please provide a value for password");
      return;
    }
    const data = {
      username: username,
      password: password,
    };

    const response = await context.login(data);

    setPassword("");
    setUsername("");
    //window.location.reload();
  };

  const searchDB = async (e, search, onScroll = false) => {
    if (e) {
      e.preventDefault();
    }
    if (search !== "") {
      if (!onScroll) {
        setUsers([]);
      }
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/userProfile/usersBySearch?username=${search}&page=${pageRef.current}&limit=7`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = await response.json();
      const users = data.users;
      if (!users) {
        setUsers(users);
      } else {
        setUsers((prev) => [...prev, ...users]);
      }
    }
    if (search === "") {
      setUsers([]);
      pageRef.current = 0;
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

  const initiateOauth = () => {
    const rootURL = "https://accounts.google.com/o/oauth2/v2/auth";
    const state = uuidv4();
    document.cookie = `oauth_state=${state}; SameSite=Strict; path=/`;
    const options = {
      client_id: process.env.REACT_APP_OAUTH_CLIENTID,
      redirect_uri: `${process.env.REACT_APP_FRONTEND_URL}/oauth`,
      response_type: "code",
      scope: "openid email profile",
      state,
    };

    const params = new URLSearchParams(options);
    window.location.href = `${rootURL}?${params.toString()}`;
  };

  return (
    <>
      <header className="websiteHeader" role="banner" aria-label="Site header">
        <Link to="/" className="homepageLink">
          <img className="headerHomeIcon" src="/house.ico"></img>
          <h1 className="welcomeHeader">
            <span className="headerTitle">Welcome</span>{" "}
            <strong className="headerTitle">Home</strong>
          </h1>
        </Link>

        {user && (
          <div className="interactionComponents">
            <div
              className="searchComponent"
              role="search"
              aria-label="Search users"
            >
              <div className="searchBar">
                <img className="headerSearchIcon" src="/searchIcon.svg" />
                <form onSubmit={searchDB} role="search">
                  <input
                    className="headerSearchInput"
                    type="text"
                    name="search"
                    id="search"
                    placeholder="Search Users"
                    aria-label="Search Users"
                    value={searchInput}
                    onChange={(e) => {
                      setSearchInput(e.target.value);
                      searchDB(e, e.target.value);
                    }}
                    onBlur={(e) => {
                      setTimeout(() => {
                        setSearchInput("");
                        pageRef.current = 0;
                        searchDB(e, e.target.value);
                      }, 150);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        sendUserToProfilePageSearch(e, e.target.value);
                      }
                    }}
                  />
                </form>
              </div>
              {searchInput && (
                <ul
                  className="searchResults scroll-container"
                  ref={searchRef}
                  role="list"
                  aria-label="Search results"
                >
                  {users.map((user, index) => (
                    <li className="searchOption" key={index} role="listitem">
                      <Link to={`/userProfile/${user.id}`}>
                        <button
                          className="userListItem"
                          aria-label={`View profile of ${user.username}`}
                        >
                          {user.username}
                        </button>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="userProfile" role="region" aria-label="User menu">
              <div
                className="profileName"
                role="status"
                aria-label={
                  friendRequests.length
                    ? `You have ${friendRequests.length} new friend requests`
                    : "No new friend requests"
                }
              >
                {friendRequests.length !== 0 ? (
                  <div className="notifications" aria-hidden="true">
                    !
                  </div>
                ) : (
                  <span aria-hidden="true"></span>
                )}
              </div>

              <div className="DropDown">
                <button
                  id="dropdown-button"
                  className="dropdownButton"
                  onClick={isDropDown}
                  aria-haspopup="menu"
                  aria-expanded={dropDown}
                  aria-controls="user-menu"
                  aria-label="User options"
                >
                  <div>{user.username}</div>
                  <div aria-hidden="true">{dropDown ? "▲" : "▼"}</div>
                </button>

                <div
                  id="userMenu"
                  className={`Menu ${dropDown ? "show" : "hide"}`}
                  role="menu"
                  aria-labelledby="dropdown-button"
                >
                  <div className="profile menu-item">
                    <Link to={`/userProfile/${user.id}`}>
                      <button
                        className="profileButton"
                        onClick={isDropDown}
                        role="menuitem"
                      >
                        Profile
                      </button>
                    </Link>
                  </div>

                  <div className="friends menu-item">
                    <Link to={`/userProfile/friends`} className="friendsLink">
                      <button
                        className="friendsButton"
                        onClick={isDropDown}
                        role="menuitem"
                      >
                        Friends
                      </button>
                    </Link>
                    {friendRequests.length !== 0 && (
                      <div
                        className="notifications friendRequestNotifications"
                        role="status"
                        aria-label={`You have ${friendRequests.length} pending friend requests`}
                      >
                        {friendRequests.length}
                      </div>
                    )}
                  </div>

                  <button
                    className="logout menu-item"
                    onClick={logoutHandler}
                    role="menuitem"
                  >
                    Log Out
                  </button>
                </div>
              </div>

              <button
                onClick={toggleTheme}
                className="themeToggle"
                aria-label="Toggle theme"
              >
                {isLightTheme ? "🌙" : "☀️"}
              </button>
            </div>
          </div>
        )}

        {!user && (
          <button
            onClick={toggleTheme}
            className="themeToggle noUser"
            aria-label="Toggle theme"
          >
            {isLightTheme ? "🌙" : "☀️"}
          </button>
        )}
      </header>

      {!user &&
        location.pathname !== "/signup" &&
        location.pathname !== "/oauth" && (
          <section
            className="loginHeader"
            role="region"
            aria-label="Login form"
          >
            {loginError && (
              <div className="loginError" aria-label="Login Error">
                {loginError}
              </div>
            )}
            <form
              className="loginForm"
              onSubmit={loginHandler}
              role="form"
              aria-labelledby="login-heading"
            >
              <h2 id="login-heading" className="sr-only">
                Log In
              </h2>
              <div className="usernameForm">
                <label className="usernameFormLabel" htmlFor="username">Username:</label>
                <input
                  className="usernameInput"
                  name="username"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="passwordForm">
                <label className="passwordFormLabel" htmlFor="password">Password:</label>
                <input
                  className="passwordInput"
                  name="password"
                  id="password"
                  type="password"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button className="loginButton" type="submit" aria-label="Log In">
                Log In
              </button>
            </form>
            <button className="OAuthButton" onClick={initiateOauth}>
              Log in Or Sign Up With <img src="googleLogo.png"></img>
            </button>
            <Link to="/signup" className="signup">
              Signup
            </Link>
          </section>
        )}
    </>
  );
};

export default HeaderComponent;
