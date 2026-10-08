import { useEffect, useState } from "react";
import "../styles/explore.css";
import "../styles/pastel-theme.css";
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

    // Get filter options from the database
    const gameOptions = [
        ...new Map(
            users
                .flatMap((user) => user.games || [])
                .filter((game) => game.name)
                .map((game) => [
                    game.name.trim().toLowerCase(),
                    game.name.trim()
                ])
        ).values()
    ].sort();

    const regionOptions = [
        ...new Map(
            users
                .map((user) => user.region)
                .filter(Boolean)
                .map((region) => [
                    region.trim().toLowerCase(),
                    region.trim()
                ])
        ).values()
    ].sort();

    const platformOptions = [
        ...new Map(
            users
                .flatMap((user) => user.platforms || [])
                .filter(Boolean)
                .map((platform) => [
                    platform.trim().toLowerCase(),
                    platform.trim()
                ])
        ).values()
    ].sort();

    // Filtering logic
    const filteredUsers = users.filter((user) => {
        const matchesGame =
            !gameFilter ||
            (user.games || []).some(
                (game) =>
                    game.name?.trim().toLowerCase() ===
                    gameFilter.trim().toLowerCase()
            );

        const matchesRegion =
            !regionFilter ||
            user.region?.trim().toLowerCase() ===
            regionFilter.trim().toLowerCase();

        const matchesPlatform =
            !platformFilter ||
            (user.platforms || []).some(
                (platform) =>
                    platform.trim().toLowerCase() ===
                    platformFilter.trim().toLowerCase()
            );

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
                        ...gameOptions.map((game) => ({
                            value: game,
                            label: game
                        }))
                    ]}
                />

                <FilterSelect
                    aria-label={"Filter gamers by region"}
                    value={regionFilter}
                    onChange={setRegionFilter}
                    options={[
                        { value: "", label: "All Regions" },
                        ...regionOptions.map((region) => ({
                            value: region,
                            label: region
                        }))
                    ]}
                />

                <FilterSelect
                    aria-label={"Filters gamers by platform"}
                    value={platformFilter}
                    onChange={setPlatformFilter}
                    options={[
                        { value: "", label: "All Platforms" },
                        ...platformOptions.map((platform) => ({
                            value: platform,
                            label: platform
                        }))
                    ]}
                />

            </div>

            {/* USERS */}

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