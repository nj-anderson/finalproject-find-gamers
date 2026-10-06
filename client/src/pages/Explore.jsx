import { useEffect, useState } from "react";
import "../styles/explore.css";
import UserCard from "../components/UserCard.jsx";

function Explore() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    // Stores filtered users
    const [gameFilter, setGameFilter] = useState("");
    const [regionFilter, setRegionFilter] = useState("");
    const [platformFilter, setPlatformFilter] = useState("");

    // Filtering logic into stored array
    const filteredUsers = users.filter((user) => {
        const matchesGame =
            !gameFilter ||
            user.games.some((game) => game.name === gameFilter);

        const matchesRegion =
            !regionFilter ||
            user.region === regionFilter;

        const matchesPlatform =
            !platformFilter ||
            user.platforms.includes(platformFilter);

        return matchesGame && matchesRegion && matchesPlatform;
    });

    useEffect(() => {
        fetch("/api/users")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to fetch users");
                }

                return response.json();
            })
            .then((data) => {
                setUsers(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error(error);
                setError("Could not load gamers.");
                setLoading(false);
            });
    }, []);

    return (
        <main>
            <h1>Explore Gamers</h1>
            <p>Search for gamers to play with.</p>

            {/* FILTERS */}
            <div className="filters">
                <select
                    value={gameFilter}
                    onChange={(e) => setGameFilter(e.target.value)}
                >
                    <option value="">All Games</option>
                    <option value="Valorant">Valorant</option>
                    <option value="Minecraft">Minecraft</option>
                    <option value="Rocket League">Rocket League</option>
                    <option value="Overwatch 2">Overwatch 2</option>
                </select>

                <select
                    value={regionFilter}
                    onChange={(e) => setRegionFilter(e.target.value)}
                >
                    <option value="">All Regions</option>
                    <option value="North America East">North America East</option>
                    <option value="North America West">North America West</option>
                </select>

                <select
                    value={platformFilter}
                    onChange={(e) => setPlatformFilter(e.target.value)}
                >
                    <option value="">All Platforms</option>
                    <option value="PC">PC</option>
                    <option value="PlayStation">PlayStation</option>
                    <option value="Xbox">Xbox</option>
                </select>
            </div>


            {/* USERS */}
            {loading && <p>Loading gamers...</p>}

            {error && <p>{error}</p>}

            {!loading && !error && (
                <div className="user-card-container">
                    {filteredUsers.map((user) => (
                        <UserCard key={user._id} user={user} />
                    ))}
                </div>
            )}
        </main>
    );
}

export default Explore;