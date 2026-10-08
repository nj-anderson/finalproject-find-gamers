import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../auth/useAuth";
import "../styles/navbar.css";

function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Number of incoming friend requests, shown as a badge on Connections
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        if (!user) {
            return;
        }

        function loadPendingCount() {
            fetch("/api/connections/pending")
                .then((response) => (response.ok ? response.json() : []))
                .then((requests) => setPendingCount(requests.length))
                .catch(() => setPendingCount(0));
        }

        loadPendingCount();

        // Fired after accepting or declining, so the badge updates right away
        window.addEventListener("connections-changed", loadPendingCount);

        return () => {
            window.removeEventListener("connections-changed", loadPendingCount);
        };
    }, [user, location.pathname]);

    // Never show an old count after logging out
    const badgeCount = user ? pendingCount : 0;

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
