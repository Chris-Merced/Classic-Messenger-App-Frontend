import React from "react";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState, useContext, useRef } from "react";
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
  const [aboutMeEdit, setAboutMeEdit] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(null);
  const [profilePictureEdit, setProfilePictureEdit] = useState(null);
  const [profilePictureEditConfirm, setProfilePictureEditConfirm] =
    useState(false);
  const [mutualFriends, setMutualFriends] = useState([]);

  const { userIdentifier } = useParams();
  const userContext = useContext(UserContext);
  const chatContext = useContext(UserChatsContext);
  const navigate = useNavigate();

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
        if (data.isBlocked !== isBlocked) {
          setIsBlocked(data.isBlocked);
        }
      }
    };
    if (userContext?.user?.id) {
      getUserProfile();
      checkIfBlocked();

      checkIfFriends();
    }

    setEditPage(false);
  }, [userIdentifier]);

  useEffect(() => {
    const checkFriendRequest = async () => {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/userProfile/friendRequestSent?userID=${userContext.user.id}&profileID=${userIdentifier}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      const data = await response.json();
      setRequestSent(data)
    };

    checkFriendRequest();
    setRequestSent(null);
  }, []);

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

        setProfile(data.user);
      } catch (err) {
        setError("Error occured on profile retrieval", err);
      }
    };

    if (userContext?.user?.id) {
      getUserProfile();
    }
  }, [editPage]);

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
  }, [userIdentifier]);

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

  useEffect(() => {
    if (userContext?.user?.id && userContext.user.id != userIdentifier) {
      const getMutualFriends = async () => {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/userProfile/mutualFriends?userID=${userContext.user.id}&profileID=${userIdentifier}`
        );
        const data = await response.json();
        setMutualFriends(data);
      };
      getMutualFriends();
    }
  }, [userIdentifier]);

  const sendDirectMessage = async () => {
    if (userContext?.user?.id) {
      const user = userContext.user;
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/conversations?userID=${user.id}&profileID=${profile.id}`
        );
        const data = await response.json();

        if (data.conversation_id) {
          chatContext.changeChat({
            name: null,
            conversationID: data.conversation_id,
            reciever: [profile.username],
          });

          navigate("/");
        }
      } catch (error) {
        console.error("Error in sendDirectMessage:", error);
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

  const handleProfilePicture = async (clientX, clientY) => {
    if (!profilePictureEdit) {
      return;
    }

    setCursorPosition({ x: clientX, y: clientY });

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
    if (response.ok) {
      setProfilePictureEditConfirm(true);

      setTimeout(() => {
        setProfilePictureEditConfirm(false);
      }, 1500);
    }
    const data = await response.json();
    console.log(data);
  };

  const changeAboutMe = async (e) => {
    e.preventDefault();

    let aboutMe = {
      aboutMe: e.target[0].value
        .trim()
        .replace(/ {3,}/g, "  ")
        .replace(/\n{3,}/g, "\n\n"),
      userID: userContext.user.id,
    };

    setCursorPosition({ x: e.clientX, y: e.clientY });

    const response = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}/userProfile/aboutMe`,
      {
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
        credentials: "include",
        body: JSON.stringify(aboutMe),
      }
    );

    const data = await response.json();

    if (response.ok) {
      setAboutMeEdit(true);

      setTimeout(() => {
        setAboutMeEdit(false);
      }, 1500);
    }
  };

  return (
    <div>
      {userContext?.user?.id ? (
        <div
          className="userProfilePage"
          role="region"
          aria-label="User profile page"
        >
          {profile &&
          (isPublic ||
            friendStatus ||
            userContext?.user?.id == userIdentifier) ? (
            <div
              className="userProfilePermission"
              role="region"
              aria-label="Profile content"
            >
              <div className="userHeader" role="banner">
                {userContext?.user?.profile_picture ? (
                  <img
                    className="profileImage"
                    src={profile.profile_picture}
                    alt={`${profile.username} profile picture`}
                  />
                ) : (
                  <img
                    className="profileImage"
                    src="/defaultProfileImage.png"
                    alt="Default profile picture"
                  />
                )}

                <h3>{profile.username}</h3>

                {blockedByProfile ? (
                  <div role="alert">You Are Currently Blocked by This User</div>
                ) : (
                  userContext.user.id != userIdentifier && (
                    <button
                      onClick={() => sendDirectMessage(userContext.user.id)}
                      aria-label={`Send direct message to ${profile.username}`}
                    >
                      Direct Message
                    </button>
                  )
                )}
                {isBlocked === false ? (
                  userContext?.user?.id != userIdentifier && (
                    <button
                      className="block"
                      onClick={blockUser}
                      aria-label={`Block user ${profile.username}`}
                    >
                      Block User
                    </button>
                  )
                ) : (
                  <button
                    onClick={unblockUser}
                    aria-label={`Unblock user ${profile.username}`}
                  >
                    Unblock User
                  </button>
                )}
                {friendStatus === false &&
                  userContext?.user?.id != userIdentifier &&
                  (requestSent ? (
                    <button aria-label="Friend request sent">
                      Request Sent!
                    </button>
                  ) : (
                    <button
                      onClick={sendFriendRequest}
                      aria-label={`Send friend request to ${profile.username}`}
                    >
                      Send Friend Request
                    </button>
                  ))}
              </div>
              {userContext?.user?.id == userIdentifier && editPage && (
                <label
                  className="editProfilePicture"
                  htmlFor="profile-picture-upload"
                  aria-label="Upload your photo"
                >
                  Upload Your Photo
                  <input
                    id="profile-picture-upload"
                    type="file"
                    onChange={handleProfilePictureChange}
                    className="editProfilePicture"
                    aria-label="Choose profile picture file"
                  />
                  <>
                    <button
                      className="changeProfilePicture"
                      onClick={(e) =>
                        handleProfilePicture(e.clientX, e.clientY)
                      }
                      aria-label="Save profile picture"
                    >
                      Change Picture
                    </button>
                    {profilePictureEditConfirm && cursorPosition && (
                      <div
                        className="profilePicturePopup"
                        style={{
                          top: `${cursorPosition.y}px`,
                          left: `${cursorPosition.x}px`,
                        }}
                        role="status"
                        aria-live="polite"
                      >
                        Profile Picture Saved!
                      </div>
                    )}
                  </>
                </label>
              )}

              <div
                role="contentinfo"
                aria-label={`Profile created at ${profile.created_at}`}
              >
                Created at {profile.created_at}
              </div>
              <div
                className="aboutMeSection"
                role="region"
                aria-label="About Me section"
              >
                <div className="aboutMeHeader">About Me:</div>
                {!editPage ? (
                  profile.about_me ? (
                    <div className="aboutMeData">{profile.about_me}</div>
                  ) : (
                    <div role="note">
                      Oop! This user hasn't set their About Me section! How
                      mysterious!
                    </div>
                  )
                ) : (
                  <>
                    <form
                      className="editAboutMe"
                      onSubmit={changeAboutMe}
                      role="form"
                      aria-label="Edit About Me form"
                    >
                      <textarea
                        className="aboutMeInput"
                        defaultValue={profile.about_me ? profile.about_me : ""}
                        aria-label="About me text"
                      ></textarea>
                      <button
                        className="aboutMeSubmit"
                        type="submit"
                        aria-label="Submit About Me"
                      >
                        Save About Me
                      </button>
                    </form>
                    {aboutMeEdit && cursorPosition && (
                      <div
                        className="aboutMePopup"
                        style={{
                          top: `${cursorPosition.y}px`,
                          left: `${cursorPosition.x}px`,
                        }}
                        role="status"
                        aria-live="polite"
                      >
                        About Me Saved!
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="mutualFriends">
                <h3 className="mutualFriendsHeader">Mutual Friends</h3>
                <ul className="mutualFriendsList scroll-container">
                  {mutualFriends &&
                    mutualFriends.map((friend, index) => (
                      <li className="mutualFriendListItem" key={index}>
                        <Link
                          className="mutualFriendLink"
                          to={`/userProfile/${friend.id}`}
                        >
                          <img
                            src={
                              friend.profile_picture
                                ? friend.profile_picture
                                : "/defaultProfileImage.png"
                            }
                          ></img>
                          {friend.username}
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          ) : (
            <div
              className="userProfileNoPermission"
              role="region"
              aria-label="No profile permission"
            >
              <div className="userHeader" role="banner">
                <img
                  className="profileImage"
                  src="/defaultProfileImage.png"
                  alt="Default profile picture"
                />
                <h3>{profile.username}</h3>
                {isBlocked === false ? (
                  <button
                    className="block"
                    onClick={blockUser}
                    aria-label={`Block user ${profile.username}`}
                  >
                    Block User
                  </button>
                ) : (
                  <button
                    onClick={unblockUser}
                    aria-label={`Unblock user ${profile.username}`}
                  >
                    Unblock User
                  </button>
                )}
                {friendStatus === false &&
                  userContext?.user?.id != userIdentifier &&
                  (requestSent ? (
                    <button aria-label="Friend request sent">
                      Request Sent!
                    </button>
                  ) : (
                    <button
                      onClick={sendFriendRequest}
                      aria-label={`Send friend request to ${profile.username}`}
                    >
                      Send Friend Request
                    </button>
                  ))}
              </div>
              <div
                role="contentinfo"
                aria-label={`Profile created at ${profile.created_at}`}
              >
                Created at {profile.created_at}
              </div>
              <div role="region" aria-label="About Me section">
                <div>About Me:</div>
                {profile.about_me ? (
                  <div>{profile.about_me}</div>
                ) : (
                  <div role="note">This user has not set their about me</div>
                )}
              </div>
            </div>
          )}
          {userContext?.user?.id == userIdentifier && (
            <div className="userProfileMod">
              <div
                className="profileStatus"
                role="region"
                aria-label="Profile visibility toggle"
              >
                {isPublic ? (
                  <button
                    onClick={changeProfileStatus}
                    aria-label="Change profile to private"
                  >
                    Change Profile to Private
                  </button>
                ) : (
                  <button
                    onClick={changeProfileStatus}
                    aria-label="Change profile to public"
                  >
                    Change Profile to Public
                  </button>
                )}
              </div>
              <button
                className="editProfile"
                onClick={isEditPage}
                aria-label="Edit profile"
              >
                Edit Profile
              </button>
            </div>
          )}
        </div>
      ) : (
        <div role="alert"></div>
      )}
    </div>
  );
};

export default UserProfile;
