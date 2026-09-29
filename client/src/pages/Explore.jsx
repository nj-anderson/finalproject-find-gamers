    import { useEffect, useState } from "react";
    import "../styles/explore.css";
    import { Link } from "react-router-dom";

    function Explore() {
        const [users, setUsers] = useState([]);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);

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

                {loading && <p>Loading gamers...</p>}

                {error && <p>{error}</p>}

                {!loading && !error && (
                    <div>
                        {users.map((user) => (
                            <div key={user._id}> 
                            <h2>{user.username}</h2> 
                            <p>{user.bio}</p> 
                            <p>Region: {user.region}</p> 
                            <p>Platforms: {user.platforms?.join(", ")}

                            </p>
                            <Link to={`/profile/${user._id}`}>
                            View Profile
                            </Link>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        );
    }

    export default Explore;