import "../styles/UserCard.css";
import { Users, MapPin, Monitor, Gamepad2, Gem, Crosshair, ChartNoAxesColumn} from "lucide-react";

function UserCard({ user }) {
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
                            🎮
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

        </div>
    );
}

export default UserCard;