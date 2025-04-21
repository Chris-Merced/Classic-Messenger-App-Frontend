import React from "react";
import { useParams } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { UserContext } from "../context/userContext";
import { UserChatsContext } from "../context/chatListContext";
import { useNavigate } from "react-router-dom";

const UserProfile = () => {
  const [profile, setProfile] = useState("");
  const [error, setError] = useState("");
  const [isBlocked, setIsBlocked] = useState("");
  const [blockedByProfile, setBlockedByProfile] = useState("");
  const [friendStatus, setFriendStatus] = useState("");
  const [isPublic, setIsPublic] = useState("");
  const [requestSent, setRequestSent] = useState(false);
  const [editPage, setEditPage] = useState(false);
  const [profilePictureEdit, setProfilePictureEdit] = useState(null);

  const { userIdentifier } = useParams();
  const userContext = useContext(UserContext);
  const chatContext = useContext(UserChatsContext);
  const navigate = useNavigate();



//WHEN CHANGING PROFILE FROM PUBLIC TO PRIVATE IT CHANGES THE PROFILE PICTURE


  useEffect(() => {
    const getUserProfile = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/userProfile/publicProfile?ID=${userIdentifier}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message);
        }

        data.user = {
          ...data.user,
          created_at: data.user.created_at.split("T")[0],
        };

        console.log("USER DATA");
        console.log(data);

        setProfile(data.user);
      } catch (err) {
        setError("Error occured on profile retrieval", err);
      }
    };

    const checkIfFriends = async () => {
      if (userContext?.user?.id) {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/userProfile/checkIfFriends?userID=${userContext.user.id}&friendID=${userIdentifier}`
        );
        const friendStatus = await response.json();
        setFriendStatus(friendStatus.friendStatus);
      }
    };

    const checkIfBlocked = async () => {
      if (userContext?.user?.id) {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/userProfile/checkIfBlocked?userID=${userContext.user.id}&blockedID=${userIdentifier}`
        );
        const data = await response.json();
        setIsBlocked(data.isBlocked);
      }
    };

    if (userContext?.user?.id) {
      getUserProfile();

      checkIfFriends();
      checkIfBlocked();
    }

    setEditPage(false)
  }, [userIdentifier, isBlocked]);

  useEffect(() => {
    const checkIfPublic = async () => {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/userProfile/profileStatus?profileID=${userIdentifier}`
      );
      const data = await response.json();
      setIsPublic(data);
    };
    if (userContext?.user?.id) {
      checkIfPublic();
    }
  }, [isPublic]);

  useEffect(() => {
    if (userContext?.user?.id) {
      const checkIfBlockedByProfile = async () => {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/userProfile/blockedByProfile?userID=${userContext.user.id}&profileID=${userIdentifier}`
        );
        const data = await response.json();
        setBlockedByProfile(data);
      };
      checkIfBlockedByProfile();
    }

  }, [userIdentifier]);

  const sendDirectMessage = async (userID) => {
    if (userContext?.user?.id) {
      const user = userContext.user;
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/conversations?userID=${user.id}&profileID=${profile.id}`
      );
      const data = await response.json();

      if (data.conversation_id) {
        chatContext.changeChat({
          name: null,
          conversationID: data.conversation_id,
        });
        navigate("/");
      }
    }
  };

  const sendFriendRequest = async () => {
    const data = {
      userID: userContext.user.id,
      profileID: userIdentifier,
    };

    const response = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}/userProfile/friendRequest`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      }
    );
    setRequestSent(true);
    const newData = await response.json();
  };

  const blockUser = async () => {
    const user = userContext.user;

    const body = { userID: user.id, blockedID: userIdentifier };
    const response = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}/userProfile/blockUser`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );
    const data = await response.json();
    setIsBlocked(true);
  };

  const unblockUser = async () => {
    const body = { userID: userContext.user.id, unblockedID: userIdentifier };

    const response = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}/userProfile/unblockUser`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );
    const data = await response.json();
    setIsBlocked(false);
  };

  const changeProfileStatus = async () => {
    const body = { userID: userContext.user.id, status: isPublic };

    const response = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}/userProfile/changeProfileStatus?userID=${userContext.user.id}`,
      {
        method: "PATCH",
        credentials: "include",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
      }
    );

    const data = await response.json();
    if (data.changed) {
      if (isPublic) {
        setIsPublic(false);
      } else {
        setIsPublic(true);
      }
    }
  };

  const isEditPage = () => {
    setEditPage((prev) => !prev);
  };

  const handleProfilePictureChange = (e) => {
    setProfilePictureEdit(e.target.files[0]);
  };

  const handleProfilePicture = async () => {
    if (!profilePictureEdit) {
      return;
    }

    const formData = new FormData();
    formData.append("ProfilePicture", profilePictureEdit);
    formData.append("userID", userContext.user.id);

    const response = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}/userprofile/profilePicture`,
      {
        method: "POST",
        body: formData,
        credentials: "include",
      }
    );
    const data = await response.json();
    console.log(data);
  };


  const changeAboutMe = async(e) =>{
    e.preventDefault()
    console.log(e.target[0].value)

  }
  console.log(userContext);

  return (
    <div>
      {userContext?.user?.id ? (
        <div className="userProfilePage">
          {profile && (isPublic || friendStatus) ? (
            <div className="userProfilePermission">
              <div className="userHeader">
                {userContext?.user?.profile_picture ? (
                  <img
                    className="profileImage"
                    src={userContext.user.profile_picture}
                  ></img>
                ) : (
                  <img
                    className="profileImage"
                    src="/defaultProfileImage.png"
                  ></img>
                )}
                {userContext?.user?.id == userIdentifier && editPage && (
                  <label>
                    Upload Your Photo
                    <input
                      type="file"
                      onChange={handleProfilePictureChange}
                      className="editProfilePicture"
                    />
                    <button onClick={handleProfilePicture}>
                      Change Picture
                    </button>
                  </label>
                )}
                <h1>{profile.username}</h1>
                {blockedByProfile ? (
                  <div>You Are Currently Blocked by This User</div>
                ) : (
                  userContext.user.id != userIdentifier && (
                    <button
                      onClick={() => sendDirectMessage(userContext.user.id)}
                    >
                      Direct Message
                    </button>
                  )
                )}
                {isBlocked === false ? (
                  userContext?.user?.id != userIdentifier && (
                    <button className="block" onClick={blockUser}>
                      Block User
                    </button>
                  )
                ) : (
                  <button onClick={unblockUser}>Unblock User</button>
                )}
                {friendStatus === false &&
                  userContext?.user?.id != userIdentifier &&
                  (requestSent ? (
                    <button>Request Sent!</button>
                  ) : (
                    <button onClick={sendFriendRequest}>
                      Send Friend Request
                    </button>
                  ))}
              </div>
              <div>Created at {profile.created_at}</div>
              <div>About Me: </div>
              
              
              {
              !editPage ?
              profile.about_me ? (
                <div>{profile.about_me}</div>
              ) : (
                <div>
                  Oop! This user hasn't set their About Me section! How
                  mysterious!
                </div>
              )
              : 
              <form onSubmit={changeAboutMe}>
              <textarea className="aboutMeTextArea" defaultValue={profile.about_me ? profile.about_me : ""}></textarea>
              <button type='submit'>submit</button>
              </form>
              }
            </div>
          ) : (
            <div className="userProfileNoPermission">
              <div className="userHeader">
                <img
                  className="profileImage"
                  src="/defaultProfileImage.png"
                ></img>
                <div>{profile.username}</div>
                {isBlocked === false ? (
                  <button className="block" onClick={blockUser}>
                    Block User
                  </button>
                ) : (
                  <button onClick={unblockUser}>Unblock User</button>
                )}
                {friendStatus === false &&
                  userContext?.user?.id != userIdentifier && (
                    <button onClick={sendFriendRequest}>
                      Send Friend Request
                    </button>
                  )}
              </div>
              <div>Created at {profile.created_at}</div>
              <div>About Me: </div>
               {
              !editPage ?
              profile.about_me ? (
                <div>{profile.about_me}</div>
              ) : (
                <div>
                  Oop! This user hasn't set their About Me section! How
                  mysterious!
                </div>
              )
              : 
              <form onSubmit={changeAboutMe}>
              <textarea className="aboutMeTextArea" defaultValue={profile.about_me ? profile.about_me : ""}></textarea>
              <button type='submit'>submit</button>
              </form>
              }
            </div>
          )}
          {userContext?.user?.id == userIdentifier && (
            <div>
              <div className="profileStatus">
                {isPublic ? (
                  <button onClick={changeProfileStatus}>
                    Change Profile to Private
                  </button>
                ) : (
                  <button onClick={changeProfileStatus}>
                    Change Profile to Public
                  </button>
                )}
              </div>
              <button className="editProfile" onClick={isEditPage}>
                Edit Profile
              </button>
            </div>
          )}
        </div>
      ) : (
        <div></div>
      )}
    </div>
  );
};

export default UserProfile;
