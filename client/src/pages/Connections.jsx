import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/connections.css";

const GAMERTAG_LABELS = {
    discord: "Discord",
    steam: "Steam",
    xbox: "Xbox",
    playstation: "PlayStation"
};

function Connections() {
    // Temporary until authentication is finished (same as Profile).
    // Login should save the logged-in user's MongoDB _id here.
    const currentUserId = localStorage.getItem("currentUserId");

    const [pending, setPending] = useState([]);
    const [connections, setConnections] = useState([]);
    const [loading, setLoading] = useState(Boolean(currentUserId));
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    // Id of the request/connection currently being updated,
    // so its buttons can be disabled while we wait
    const [busyId, setBusyId] = useState(null);

    // Sends a request to the connections API as the current user
    async function api(path, options = {}) {
        const response = await fetch(`/api/connections${path}`, {
            ...options,
            headers: {
                "x-user-id": currentUserId
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Something went wrong.");
        }

        return data;
    }

    useEffect(() => {
        if (!currentUserId) {
            return;
        }

        const headers = { "x-user-id": currentUserId };

        Promise.all([
            fetch("/api/connections/pending", { headers }),
            fetch("/api/connections", { headers })
        ])
            .then(async ([pendingResponse, connectionsResponse]) => {
                if (!pendingResponse.ok || !connectionsResponse.ok) {
                    throw new Error("Could not load your connections.");
                }

                setPending(await pendingResponse.json());
                setConnections(await connectionsResponse.json());
                setLoading(false);
            })
            .catch((error) => {
                console.error(error);
                setError(error.message);
                setLoading(false);
            });
    }, [currentUserId]);

    async function acceptRequest(request) {
        setBusyId(request._id);
        setError("");
        setMessage("");

        try {
            // Response includes the sender's gamertags now that we're connected
            const connection = await api(`/${request._id}/accept`, {
                method: "PATCH"
            });

            setPending((old) =>
                old.filter((item) => item._id !== request._id)
            );
            setConnections((old) => [connection, ...old]);

            setMessage(`You are now connected with ${request.user.username}!`);
        } catch (error) {
            setError(error.message);
        }

        setBusyId(null);
    }

    async function declineRequest(request) {
        setBusyId(request._id);
        setError("");
        setMessage("");

        try {
            await api(`/${request._id}`, { method: "DELETE" });

            setPending((old) =>
                old.filter((item) => item._id !== request._id)
            );

            setMessage(`Declined ${request.user.username}'s request.`);
        } catch (error) {
            setError(error.message);
        }

        setBusyId(null);
    }

    async function removeConnection(connection) {
        const confirmed = window.confirm(
            `Remove ${connection.user.username} from your connections?`
        );

        if (!confirmed) {
            return;
        }

        setBusyId(connection._id);
        setError("");
        setMessage("");

        try {
            await api(`/${connection._id}`, { method: "DELETE" });

            setConnections((old) =>
                old.filter((item) => item._id !== connection._id)
            );

            setMessage(`Removed ${connection.user.username}.`);
        } catch (error) {
            setError(error.message);
        }

        setBusyId(null);
    }

    if (!currentUserId) {
        return (
            <main className="connections-page">
                <div className="connections-alert error">
                    Log in to see your connections.
                </div>
            </main>
        );
    }

    if (loading) {
        return (
            <main className="connections-page">
                <p className="connections-empty">Loading connections...</p>
            </main>
        );
    }

    return (
        <main className="connections-page">
            <header className="connections-header">
                <h1>Connections</h1>
                <p>Manage friend requests and find your teammates' gamertags.</p>
            </header>

            {message && (
                <div className="connections-alert success" role="status">
                    {message}
                </div>
            )}

            {error && (
                <div className="connections-alert error" role="alert">
                    {error}
                </div>
            )}

            {/* PENDING REQUESTS */}

            <section className="connections-section">
                <h2>
                    Pending Requests
                    {pending.length > 0 && (
                        <span className="connections-count">
                            {pending.length}
                        </span>
                    )}
                </h2>

                {pending.length === 0 ? (
                    <p className="connections-empty">
                        No pending requests right now.
                    </p>
                ) : (
                    <div className="connections-grid">
                        {pending.map((request) => (
                            <article
                                className="connection-card"
                                key={request._id}
                            >
                                <UserSummary user={request.user} />

                                <p className="connection-date">
                                    Sent {formatDate(request.sentAt)}
                                </p>

                                <div className="connection-actions">
                                    <button
                                        type="button"
                                        className="connections-primary"
                                        onClick={() => acceptRequest(request)}
                                        disabled={busyId === request._id}
                                    >
                                        Accept
                                    </button>

                                    <button
                                        type="button"
                                        className="connections-secondary"
                                        onClick={() => declineRequest(request)}
                                        disabled={busyId === request._id}
                                    >
                                        Decline
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>

            {/* ACCEPTED CONNECTIONS */}

            <section className="connections-section">
                <h2>My Connections</h2>

                {connections.length === 0 ? (
                    <p className="connections-empty">
                        No connections yet. Find teammates on the{" "}
                        <Link to="/explore">Explore</Link> page.
                    </p>
                ) : (
                    <div className="connections-grid">
                        {connections.map((connection) => (
                            <article
                                className="connection-card"
                                key={connection._id}
                            >
                                <UserSummary user={connection.user} />

                                <Gamertags gamertags={connection.user.gamertags} />

                                <p className="connection-date">
                                    Connected {formatDate(connection.connectedAt)}
                                </p>

                                <div className="connection-actions">
                                    <button
                                        type="button"
                                        className="danger-link"
                                        onClick={() => removeConnection(connection)}
                                        disabled={busyId === connection._id}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}

// Avatar, name, region and games for one user
function UserSummary({ user }) {
    const gameNames = (user.games || []).map((game) => game.name);

    return (
        <div className="connection-user">
            <div className="connection-avatar">
                {user.profilePicture ? (
                    <img
                        src={user.profilePicture}
                        alt=""
                    />
                ) : (
                    <span>{user.username.slice(0, 2).toUpperCase()}</span>
                )}
            </div>

            <div className="connection-info">
                <Link
                    to={`/profile/${user._id}`}
                    className="connection-name"
                >
                    {user.username}
                </Link>

                <p>{user.region || "No region"}</p>

                {gameNames.length > 0 && (
                    <p className="connection-games">
                        🎮 {gameNames.join(" · ")}
                    </p>
                )}
            </div>
        </div>
    );
}

// Gamertags are only sent by the server once a request is accepted
function Gamertags({ gamertags }) {
    const listed = Object.entries(gamertags || {}).filter(
        ([, value]) => value
    );

    if (listed.length === 0) {
        return (
            <p className="connections-empty">No gamertags listed.</p>
        );
    }

    return (
        <dl className="connection-gamertags">
            {listed.map(([type, value]) => (
                <div key={type}>
                    <dt>{GAMERTAG_LABELS[type] || type}</dt>
                    <dd>{value}</dd>
                </div>
            ))}
        </dl>
    );
}

function formatDate(date) {
    return new Date(date).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
}

export default Connections;
