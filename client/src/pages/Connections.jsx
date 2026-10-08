import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Copy, Crosshair, Gamepad2, Gem, Inbox, Send, UserSearch, Users } from "lucide-react";
import useAuth from "../auth/useAuth";
import "../styles/connections.css";

const GAMERTAG_LABELS = {
    discord: "Discord",
    steam: "Steam",
    xbox: "Xbox",
    playstation: "PlayStation"
};

function Connections() {
    // This page is login-only, so user is always set
    const { user } = useAuth();
    const currentUserId = user._id;

    // The current user's own games, used for "You both play"
    const [myGames, setMyGames] = useState([]);

    const [pending, setPending] = useState([]);
    const [sent, setSent] = useState([]);
    const [connections, setConnections] = useState([]);
    const [suggestions, setSuggestions] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    // Id of the card currently being updated,
    // so its buttons can be disabled while we wait
    const [busyId, setBusyId] = useState(null);

    // Sends a request to the connections API as the logged-in user
    async function api(path, options = {}) {
        const response = await fetch(`/api/connections${path}`, {
            ...options,
            headers: {
                "Content-Type": "application/json"
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Something went wrong.");
        }

        return data;
    }

    useEffect(() => {
        const urls = [
            `/api/users/${currentUserId}`,
            "/api/connections/pending",
            "/api/connections/sent",
            "/api/connections",
            "/api/connections/suggestions"
        ];

        Promise.all(urls.map((url) => fetch(url)))
            .then(async (responses) => {
                if (responses.some((response) => !response.ok)) {
                    throw new Error("Could not load your connections.");
                }

                const [me, pending, sent, connections, suggestions] =
                    await Promise.all(
                        responses.map((response) => response.json())
                    );

                setMyGames(me.games || []);
                setPending(pending);
                setSent(sent);
                setConnections(connections);
                setSuggestions(suggestions);
                setLoading(false);
            })
            .catch((error) => {
                console.error(error);
                setError(error.message);
                setLoading(false);
            });
    }, [currentUserId]);

    // Someone removed or declined may be a good suggestion again
    async function reloadSuggestions() {
        try {
            setSuggestions(await api("/suggestions"));
        } catch (error) {
            console.error(error);
        }
    }

    /*
        Runs one card action: disables its buttons, clears old
        messages and shows the result.
    */
    async function runAction(id, action, successMessage) {
        setBusyId(id);
        setError("");
        setMessage("");

        try {
            await action();
            setMessage(successMessage);

            // Lets the Navbar update its pending-request badge
            window.dispatchEvent(new Event("connections-changed"));
        } catch (error) {
            setError(error.message);
        }

        setBusyId(null);
    }

    function acceptRequest(request) {
        return runAction(
            request._id,
            async () => {
                // Response includes their gamertags now that we're connected
                const connection = await api(`/${request._id}/accept`, {
                    method: "PATCH"
                });

                setPending((old) => old.filter((item) => item._id !== request._id));
                setConnections((old) => [connection, ...old]);
            },
            `You are now connected with ${request.user.username}!`
        );
    }

    function declineRequest(request) {
        return runAction(
            request._id,
            async () => {
                await api(`/${request._id}`, { method: "DELETE" });

                setPending((old) => old.filter((item) => item._id !== request._id));
                await reloadSuggestions();
            },
            `Declined ${request.user.username}'s request.`
        );
    }

    function cancelRequest(request) {
        return runAction(
            request._id,
            async () => {
                await api(`/${request._id}`, { method: "DELETE" });

                setSent((old) => old.filter((item) => item._id !== request._id));
                await reloadSuggestions();
            },
            `Cancelled your request to ${request.user.username}.`
        );
    }

    function removeConnection(connection) {
        const confirmed = window.confirm(
            `Remove ${connection.user.username} from your connections?`
        );

        if (!confirmed) {
            return;
        }

        return runAction(
            connection._id,
            async () => {
                await api(`/${connection._id}`, { method: "DELETE" });

                setConnections((old) => old.filter((item) => item._id !== connection._id));
                await reloadSuggestions();
            },
            `Removed ${connection.user.username}.`
        );
    }

    function connectWith(suggestion) {
        const { user } = suggestion;

        return runAction(
            user._id,
            async () => {
                const request = await api("", {
                    method: "POST",
                    body: JSON.stringify({ receiverId: user._id })
                });

                setSuggestions((old) => old.filter((item) => item.user._id !== user._id));
                setSent((old) => [
                    { _id: request._id, sentAt: request.createdAt, user },
                    ...old
                ]);
            },
            `Request sent to ${user.username}.`
        );
    }

    if (loading) {
        return (
            <main className="connections-page">
                <p className="connections-empty" role="status">
                    Loading connections...
                </p>
            </main>
        );
    }

    return (
        <main className="connections-page">
            <header className="connections-header">
                <div>
                    <h1>Connections</h1>
                    <p>Manage friend requests and find your teammates' gamertags.</p>
                </div>

                {/* SUMMARY */}
                <ul className="connections-summary" aria-label="Summary">
                    <li>
                        <strong>{connections.length}</strong>
                        {connections.length === 1 ? " connection" : " connections"}
                    </li>
                    <li>
                        <strong>{pending.length}</strong> pending
                    </li>
                    <li>
                        <strong>{sent.length}</strong> sent
                    </li>
                </ul>
            </header>

            {/* Always rendered so screen readers announce new messages */}
            <div role="status" aria-live="polite">
                {message && (
                    <div className="connections-alert success">
                        {message}
                    </div>
                )}
            </div>

            {error && (
                <div className="connections-alert error" role="alert">
                    {error}
                </div>
            )}

            {/*
                Two columns on wide screens:
                left = requests to answer and your connections,
                right = finding new teammates.
                On small screens they stack in this same order.
            */}
            <div className="connections-layout">
                <div className="connections-main">

                    {/* PENDING REQUESTS */}

                    <section
                        className="connections-section"
                        aria-labelledby="pending-heading"
                    >
                        <h2 id="pending-heading">
                            Pending Requests
                            {pending.length > 0 && (
                                <span className="connections-count">
                                    {pending.length}
                                    <span className="sr-only"> waiting</span>
                                </span>
                            )}
                        </h2>

                        {pending.length === 0 ? (
                            <EmptyState icon={Inbox}>
                                No pending requests right now. When someone wants to
                                team up with you, it will show up here.
                            </EmptyState>
                        ) : (
                            <div className="connections-grid">
                                {pending.map((request) => (
                                    <article
                                        className="connection-card"
                                        key={request._id}
                                        aria-label={`Request from ${request.user.username}`}
                                    >
                                        <UserSummary user={request.user} />

                                        <SharedGames user={request.user} myGames={myGames} />

                                        <p className="connection-date">
                                            Sent {formatDate(request.sentAt)}
                                        </p>

                                        {/* Labels include the name, since every card has the same buttons */}
                                        <div className="connection-actions">
                                            <button
                                                type="button"
                                                className="connections-primary"
                                                onClick={() => acceptRequest(request)}
                                                disabled={busyId === request._id}
                                                aria-label={`Accept request from ${request.user.username}`}
                                            >
                                                Accept
                                            </button>

                                            <button
                                                type="button"
                                                className="connections-secondary"
                                                onClick={() => declineRequest(request)}
                                                disabled={busyId === request._id}
                                                aria-label={`Decline request from ${request.user.username}`}
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

                    <section
                        className="connections-section"
                        aria-labelledby="connections-heading"
                    >
                        <h2 id="connections-heading">My Connections</h2>

                        {connections.length === 0 ? (
                            <EmptyState icon={Users}>
                                No connections yet. Connect with a suggested
                                teammate, or find more players on the{" "}
                                <Link to="/explore">Explore</Link> page. Once a
                                request is accepted, their gamertags appear here.
                            </EmptyState>
                        ) : (
                            <div className="connections-grid">
                                {connections.map((connection) => (
                                    <article
                                        className="connection-card"
                                        key={connection._id}
                                        aria-label={`Connection with ${connection.user.username}`}
                                    >
                                        <UserSummary user={connection.user} />

                                        <SharedGames user={connection.user} myGames={myGames} />

                                        <Gamertags
                                            username={connection.user.username}
                                            gamertags={connection.user.gamertags}
                                        />

                                        <p className="connection-date">
                                            Connected {formatDate(connection.connectedAt)}
                                        </p>

                                        <div className="connection-actions">
                                            <button
                                                type="button"
                                                className="danger-link"
                                                onClick={() => removeConnection(connection)}
                                                disabled={busyId === connection._id}
                                                aria-label={`Remove ${connection.user.username} from your connections`}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>

                </div>

                <aside className="connections-side" aria-label="Find teammates">

                    {/* SUGGESTED TEAMMATES */}

                    <section
                        className="connections-section"
                        aria-labelledby="suggestions-heading"
                    >
                        <h2 id="suggestions-heading">Suggested Teammates</h2>
                        <p className="connections-subtitle">
                            Players looking for teammates in games you play.
                        </p>

                        {suggestions.length === 0 ? (
                            <EmptyState icon={UserSearch}>
                                {myGames.length === 0 ? (
                                    <>
                                        Add games to your{" "}
                                        <Link to="/profile">profile</Link> to get
                                        suggestions.
                                    </>
                                ) : (
                                    <>
                                        No suggestions right now. Browse everyone on
                                        the <Link to="/explore">Explore</Link> page.
                                    </>
                                )}
                            </EmptyState>
                        ) : (
                            <div className="connections-grid">
                                {suggestions.map((suggestion) => (
                                    <article
                                        className="connection-card"
                                        key={suggestion.user._id}
                                        aria-label={`Suggested teammate ${suggestion.user.username}`}
                                    >
                                        <UserSummary user={suggestion.user} />

                                        <SharedGames
                                            user={suggestion.user}
                                            myGames={myGames}
                                            lookingOnly
                                        />

                                        <div className="connection-actions">
                                            <button
                                                type="button"
                                                className="connections-primary"
                                                onClick={() => connectWith(suggestion)}
                                                disabled={busyId === suggestion.user._id}
                                                aria-label={`Connect with ${suggestion.user.username}`}
                                            >
                                                Connect
                                            </button>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* SENT REQUESTS */}

                    <section
                        className="connections-section"
                        aria-labelledby="sent-heading"
                    >
                        <h2 id="sent-heading">Sent Requests</h2>

                        {sent.length === 0 ? (
                            <EmptyState icon={Send}>
                                No requests waiting for a reply.
                            </EmptyState>
                        ) : (
                            <div className="connections-grid">
                                {sent.map((request) => (
                                    <article
                                        className="connection-card"
                                        key={request._id}
                                        aria-label={`Request to ${request.user.username}`}
                                    >
                                        <UserSummary user={request.user} />

                                        <SharedGames user={request.user} myGames={myGames} />

                                        <p className="connection-date">
                                            Sent {formatDate(request.sentAt)} · Waiting for a reply
                                        </p>

                                        <div className="connection-actions">
                                            <button
                                                type="button"
                                                className="connections-secondary"
                                                onClick={() => cancelRequest(request)}
                                                disabled={busyId === request._id}
                                                aria-label={`Cancel request to ${request.user.username}`}
                                            >
                                                Cancel Request
                                            </button>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>

                </aside>
            </div>
        </main>
    );
}

// Bordered box with an icon, shown when a section has nothing in it
function EmptyState({ icon: Icon, children }) {
    return (
        <div className="connections-empty-box">
            <Icon size={22} aria-hidden="true" />
            <p>{children}</p>
        </div>
    );
}

// Avatar, name, region and games for one user
function UserSummary({ user }) {
    const gameNames = (user.games || []).map((game) => game.name);
    const isLooking = (user.games || []).some((game) => game.lookingForTeammates);

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

                <p>
                    <span className="sr-only">Region: </span>
                    {user.region || "No region"}
                </p>

                {gameNames.length > 0 && (
                    <p className="connection-games">
                        <Gamepad2 size={15} aria-hidden="true" />
                        <span className="sr-only">Games: </span>
                        {gameNames.join(" · ")}
                    </p>
                )}

                {isLooking && (
                    <p className="connection-looking">
                        <Users size={14} aria-hidden="true" />
                        Looking for teammates
                    </p>
                )}
            </div>
        </div>
    );
}

/*
    "You both play" box: the games this user shares with
    the current user, with their rank and role in each.

    lookingOnly limits it to games they want teammates for
    (used for suggestions, to match what the server picked).
*/
function SharedGames({ user, myGames, lookingOnly = false }) {
    const mine = new Set(
        myGames.map((game) => game.name.trim().toLowerCase())
    );

    const shared = (user.games || []).filter(
        (game) =>
            mine.has(game.name.trim().toLowerCase()) &&
            (!lookingOnly || game.lookingForTeammates)
    );

    if (shared.length === 0) {
        return null;
    }

    return (
        <div className="shared-games">
            <h3 className="shared-games-title">You both play</h3>

            <ul>
                {shared.map((game) => (
                    <li key={game._id || game.name}>
                        <strong>{game.name}</strong>

                        {game.rank && (
                            <span className="shared-badge">
                                <Gem size={13} aria-hidden="true" />
                                <span className="sr-only">Rank: </span>
                                {game.rank}
                            </span>
                        )}

                        {game.role && (
                            <span className="shared-badge">
                                <Crosshair size={13} aria-hidden="true" />
                                <span className="sr-only">Role: </span>
                                {game.role}
                            </span>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

// Gamertags are only sent by the server once a request is accepted
function Gamertags({ username, gamertags }) {
    const listed = Object.entries(gamertags || {}).filter(
        ([, value]) => value
    );

    if (listed.length === 0) {
        return (
            <p className="connections-empty">No gamertags listed.</p>
        );
    }

    return (
        <dl
            className="connection-gamertags"
            aria-label={`${username}'s gamertags`}
        >
            {listed.map(([type, value]) => {
                const label = GAMERTAG_LABELS[type] || type;

                return (
                    <div key={type}>
                        <dt>{label}</dt>
                        <dd>
                            <span className="gamertag-value">{value}</span>

                            <CopyButton
                                value={value}
                                label={`Copy ${username}'s ${label}: ${value}`}
                            />
                        </dd>
                    </div>
                );
            })}
        </dl>
    );
}

// Copies a gamertag to the clipboard and briefly shows a check mark
function CopyButton({ value, label }) {
    const [copied, setCopied] = useState(false);
    const timer = useRef(null);

    useEffect(() => () => clearTimeout(timer.current), []);

    async function copy() {
        try {
            await navigator.clipboard.writeText(value);

            setCopied(true);
            clearTimeout(timer.current);
            timer.current = setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error("Could not copy:", error);
        }
    }

    return (
        <>
            <button
                type="button"
                className={`copy-button${copied ? " copied" : ""}`}
                onClick={copy}
                aria-label={label}
                title={copied ? "Copied!" : "Copy"}
            >
                {copied ? (
                    <Check size={15} aria-hidden="true" />
                ) : (
                    <Copy size={15} aria-hidden="true" />
                )}
            </button>

            <span className="sr-only" role="status">
                {copied ? "Copied" : ""}
            </span>
        </>
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
