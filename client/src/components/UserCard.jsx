import { useState } from "react";
import "../styles/UserCard.css";
import { Users, MapPin, Monitor, Gamepad2, Gem, Crosshair, ChartNoAxesColumn, UserPlus, Check} from "lucide-react";
import useAuth from "../auth/useAuth";

function UserCard({ user }) {
    const { user: currentUser } = useAuth();

    // null = not sent yet, otherwise the text to show on the button
    const [requestResult, setRequestResult] = useState(null);
    const [sending, setSending] = useState(false);

    const isMe = currentUser?._id === user._id;

    // Sends a connection request to this user
    async function sendFriendRequest() {
        setSending(true);

        try {
            const response = await fetch("/api/connections", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ receiverId: user._id })
            });

            const data = await response.json();

            if (response.ok) {
                setRequestResult("Request Sent");
            } else if (response.status === 409) {
                // Already connected, or a request already exists
                setRequestResult(
                    data.message === "You are already connected"
                        ? "Already Friends"
                        : "Request Pending"
                );
            } else {
                alert(data.message || "Could not send friend request.");
            }
        } catch (error) {
            console.error(error);
            alert("Could not send friend request.");
        }

        setSending(false);
    }

    return (
        <div className="user-card">

            {/* Top section */}
            <div className="user-card-top">

                {/* Profile picture */}
                <div className="profile-picture-container">
                    <img
                        className="profile-picture"
                        src={user.profilePicture || "/images/default-profile.png"}
                        alt={`${user.username}'s profile`}
                    />

                    {user.games?.some(game => game.lookingForTeammates) && (
                        <span className="online-dot"></span>
                    )}
                </div>

                {/* User information */}
                <div className="user-info">

                    <div className="user-name-row">
                        <h2>{user.username}</h2>

                        {user.games?.some(game => game.lookingForTeammates) ? (
                            <span className="looking-badge looking">
                                <Users size={16} /> Looking for teammates
                            </span>
                        ) : (
                            <span className="looking-badge not-looking">
                                <Users size={16} />  Not looking for teammates
                            </span>
                        )}
                    </div>

                    <p className="user-region">
                        <MapPin size={16} /> {user.region}
                    </p>

                    <p className="user-bio">
                        {user.bio}
                    </p>

                    {/* Platforms */}
                    <div className="platforms">
                        {user.platforms?.map((platform) => (
                            <span className="platform-badge" key={platform}>
                                {platform === "PC" ? (
                                    <Monitor size={15} />
                                ) : (
                                    <Gamepad2 size={15} />
                                )}
                                {platform}
                            </span>
                        ))}
                    </div>

                </div>
            </div>

            {/* Games */}
            <div className="games-section">
                <h3>Games</h3>

                {user.games?.map((game) => (
                    <div className="game-card" key={game._id}>

                        <div className="game-icon">
                            <Gamepad2 aria-hidden="true" />
                        </div>

                        <div className="game-info">
                            <h4>{game.name}</h4>

                            <div className="game-badges">

                                {game.rank && (
                                    <span className="game-badge rank-badge">
                                        <Gem size={14} />
                                        {game.rank}
                                    </span>
                                )}

                                {game.role && (
                                    <span className="game-badge role-badge">
                                        <Crosshair size={14} />
                                        {game.role}
                                    </span>
                                )}

                                {game.playstyle && (
                                    <span className="game-badge playstyle-badge">
                                        <ChartNoAxesColumn size={14} />
                                        {game.playstyle}
                                    </span>
                                )}

                            </div>
                        </div>

                    </div>
                ))}
            </div>

            {/* Send Friend Request Button (not shown on your own card) */}
            {!isMe && (
                <button
                    type="button"
                    className="friend-request-button"
                    onClick={sendFriendRequest}
                    disabled={sending || requestResult !== null}
                    aria-label={
                        requestResult
                            ? `${requestResult}: ${user.username}`
                            : `Add ${user.username} as a friend`
                    }
                >
                    {requestResult ? (
                        <Check size={16} aria-hidden="true" />
                    ) : (
                        <UserPlus size={16} aria-hidden="true" />
                    )}
                    {requestResult || "Add Friend"}
                </button>
            )}

        </div>
    );
}

export default UserCard;