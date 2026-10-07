import { useEffect, useState } from "react";
import "../styles/explore.css";
import UserCard from "../components/UserCard.jsx";
import FilterSelect from "../components/FilterSelect.jsx";

function Explore() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Stores filtered users
    const [gameFilter, setGameFilter] = useState("");
    const [regionFilter, setRegionFilter] = useState("");
    const [platformFilter, setPlatformFilter] = useState("");

    // Filtering logic
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
        <main className="explore-page">

            <div className="header">
                <h1>Explore Gamers</h1>
                <p>Search for gamers to play with.</p>
            </div>

            {/* FILTERS */}
            <div className="filters">

                <FilterSelect
                    aria-label={"Filter gamers by game"}
                    value={gameFilter}
                    onChange={setGameFilter}
                    options={[
                        { value: "", label: "All Games" },
                        { value: "Valorant", label: "Valorant" },
                        { value: "Minecraft", label: "Minecraft" },
                        {
                            value: "Rocket League",
                            label: "Rocket League"
                        },
                        {
                            value: "Overwatch 2",
                            label: "Overwatch 2"
                        }
                    ]}
                />

                <FilterSelect
                    aria-label={"Filter gamers by region"}
                    value={regionFilter}
                    onChange={setRegionFilter}
                    options={[
                        { value: "", label: "All Regions" },
                        {
                            value: "North America East",
                            label: "North America East"
                        },
                        {
                            value: "North America West",
                            label: "North America West"
                        }
                    ]}
                />

                <FilterSelect
                    aria-label={"Filters gamers by platform"}
                    value={platformFilter}
                    onChange={setPlatformFilter}
                    options={[
                        { value: "", label: "All Platforms" },
                        { value: "PC", label: "PC" },
                        {
                            value: "PlayStation",
                            label: "PlayStation"
                        },
                        { value: "Xbox", label: "Xbox" }
                    ]}
                />

            </div>

            {/* USERS */}
            {loading && <p>Loading gamers...</p>}

            {error && <p>{error}</p>}

            {!loading && !error && (
                <div className="user-card-container">
                    {filteredUsers.map((user) => (
                        <UserCard
                            key={user._id}
                            user={user}
                        />
                    ))}
                </div>
            )}

        </main>
    );
}

export default Explore;