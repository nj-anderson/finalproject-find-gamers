import "../styles/UserCard.css";

function UserCard({user}) {
    return (
        <div className="user-card">
            <h1 className="user-name">{user.username}</h1>

            <img className="user-profile-picture" src={user.profilePicture}  alt={"idk yet"}/> // if no profile picture, implement default pic

            <div className="looking-for-teammates-tag">
                {user.lookingForTeammates &&
                    <p className="looking-for-teammates-tag-text">Looking for teammates</p>}
            </div>

            <p className="user-region">{user.region}</p>

            <p className="user-bio">{user.bio}</p>

            <div className="user-platforms-container">
                {user.platforms.join(", ")}
            </div>

            <h2>Games</h2>
            <div>{user.games.map((game) => (
                <div key={game._id}>
                    <h3>{game.name}</h3>
                    <p>{game.rank}</p>
                    <p>{game.role}</p>
                    <p>{game.playstyle}</p>
                </div>
            ))}</div>


        </div>
    );
}

export default UserCard;