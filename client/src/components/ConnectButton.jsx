import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

/*
    Connect button shown on another user's profile.

    Asks the server for the connection status with this user
    and shows the matching action:
        none      -> Connect
        sent      -> Request sent (Cancel)
        received  -> Accept / Decline
        connected -> Connected

    onConnected is called after accepting, so the profile
    can reload and show the newly revealed gamertags.
*/
function ConnectButton({ userId, currentUserId, onConnected }) {
    const [status, setStatus] = useState(null);
    const [connectionId, setConnectionId] = useState(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetch(`/api/connections/status/${userId}`, {
            headers: { "x-user-id": currentUserId }
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Could not load connection status.");
                }

                return response.json();
            })
            .then((data) => {
                setStatus(data.status);
                setConnectionId(data.connectionId);
            })
            .catch((error) => {
                console.error(error);
                setError(error.message);
            });
    }, [userId, currentUserId]);

    // Runs one connections API call, then moves to the next status
    async function run(path, method, body, nextStatus) {
        setBusy(true);
        setError("");

        try {
            const response = await fetch(`/api/connections${path}`, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "x-user-id": currentUserId
                },
                body: body && JSON.stringify(body)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Something went wrong.");
            }

            setStatus(nextStatus);
            setConnectionId(nextStatus === "none" ? null : data._id);

            if (nextStatus === "connected" && onConnected) {
                onConnected();
            }
        } catch (error) {
            setError(error.message);
        }

        setBusy(false);
    }

    if (!status) {
        return error ? <p className="connect-error">{error}</p> : null;
    }

    return (
        <div className="connect-actions">
            {status === "none" && (
                <button
                    type="button"
                    className="profile-primary"
                    disabled={busy}
                    onClick={() =>
                        run("", "POST", { receiverId: userId }, "sent")
                    }
                >
                    Connect
                </button>
            )}

            {status === "sent" && (
                <>
                    <span className="connect-status">Request sent</span>

                    <button
                        type="button"
                        className="profile-secondary"
                        disabled={busy}
                        onClick={() =>
                            run(`/${connectionId}`, "DELETE", null, "none")
                        }
                    >
                        Cancel
                    </button>
                </>
            )}

            {status === "received" && (
                <>
                    <button
                        type="button"
                        className="profile-primary"
                        disabled={busy}
                        onClick={() =>
                            run(`/${connectionId}/accept`, "PATCH", null, "connected")
                        }
                    >
                        Accept Request
                    </button>

                    <button
                        type="button"
                        className="profile-secondary"
                        disabled={busy}
                        onClick={() =>
                            run(`/${connectionId}`, "DELETE", null, "none")
                        }
                    >
                        Decline
                    </button>
                </>
            )}

            {status === "connected" && (
                <Link to="/connections" className="connect-status">
                    ✓ Connected
                </Link>
            )}

            {error && <p className="connect-error">{error}</p>}
        </div>
    );
}

export default ConnectButton;
