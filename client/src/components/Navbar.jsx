import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../auth/useAuth";
import "../styles/navbar.css";

function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Number of incoming friend requests, shown as a badge on Connections.
    // Saved with the user it belongs to, so switching accounts never
    // shows the previous user's count.
    const [pending, setPending] = useState({ userId: null, count: 0 });

    const userId = user?._id;

    useEffect(() => {
        if (!userId) {
            return;
        }

        function loadPendingCount() {
            fetch("/api/connections/pending")
                .then((response) => (response.ok ? response.json() : []))
                .then((requests) => setPending({ userId, count: requests.length }))
                .catch(() => {});
        }

        // Check again when coming back to this tab
        function handleVisibilityChange() {
            if (document.visibilityState === "visible") {
                loadPendingCount();
            }
        }

        loadPendingCount();

        // Requests from other people can arrive at any time, so check
        // every 10 seconds while the tab is open
        const interval = setInterval(() => {
            if (document.visibilityState === "visible") {
                loadPendingCount();
            }
        }, 10000);

        // Fired after accepting or declining, so the badge updates right away
        window.addEventListener("connections-changed", loadPendingCount);
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            clearInterval(interval);
            window.removeEventListener("connections-changed", loadPendingCount);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [userId, location.pathname]);

    // Never show an old count after logging out or switching accounts
    const badgeCount = pending.userId === userId ? pending.count : 0;

    // Ends the session on the server, then goes back to Login
    async function handleLogout() {
        await logout();
        navigate("/");
    }

    return (
        <nav>
            <Link to="/home" className="logo">
                Find Gamers
            </Link>

            <div className="nav-links">
                <Link to="/explore">Explore</Link>
                <Link to="/profile">Profile</Link>
                <Link
                    to="/connections"
                    className="nav-connections"
                    aria-label={
                        badgeCount > 0
                            ? `Connections, ${badgeCount} pending friend ${badgeCount === 1 ? "request" : "requests"}`
                            : undefined
                    }
                >
                    Connections

                    {badgeCount > 0 && (
                        <span className="nav-badge" aria-hidden="true">
                            {badgeCount}
                        </span>
                    )}
                </Link>
            </div>
            <button type="button" className="button" onClick={handleLogout}>
                Logout
            </button>
        </nav>
    );
}

export default Navbar;
