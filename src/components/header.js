import React from "react";
import { useEffect, useState, useContext } from "react";
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
  const context = useContext(UserContext);
  const chatContext = useContext(UserChatsContext);
  const userData = context.user;
  const location = useLocation();

  useEffect(() => {
    setUser(userData);

    const getUserFriendRequests = async () => {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/userProfile/friendRequest?userID=${context.user.id}`,{
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
    if(userData){
    getUserFriendRequests();
    }
  }, [userData]);

  


  const isDropDown = () => {
    if (dropDown === false) {
      setDropDown(true);
    } else {
      setDropDown(false);
    }
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

  
  //MAKE SURE TO SET UP SSE FOR SERVER SIDE UPDATES FOR THE NOTIFICAITON
  //  NUMBER IN HEADER

  return (
    <div className="websiteHeader">
      <Link to="/" className="homepageLink">
        <h1>Welcome Home</h1>
      </Link>
      {user ? (
        <>
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
              ></input>
              <ul className="searchResults">
                {users.map((user, index) => (
                  <li key={index}>
                    <Link to={`/userProfile/${user.id}`}>{user.username}</Link>
                  </li>
                ))}
              </ul>
            </form>
          </div>
          <div className="userProfile">
            <div className="profileName">
              {" "}
              Hello {user.username}{" "}
              {friendRequests.length !== 0 ? (
                <div className="notifications">{friendRequests?.length}</div>
              ): <span></span>}
            </div>
            <div className="DropDown">
              <button onClick={isDropDown}>Drop-Down</button>
              {dropDown && (
                <div className="Menu">
                  <div className="friends"><Link to={`/userProfile/friends`}>Friends</Link> {friendRequests.length !== 0 ? <div className="friendRequestNotifications">{friendRequests?.length}</div> : <span></span>}</div>
                  <button className="logout" onClick={logoutHandler}>
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
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
