import { Link } from "react-router-dom";
import "../styles/navbar.css";

function Navbar() {
    return (
        <nav>
            <Link to="/home" className="logo">
                Find Gamers
            </Link>

            <div className="nav-links">
                <Link to="/explore">Explore</Link>
                <Link to="/profile">Profile</Link>
                <Link to="/connections">Connections</Link>
            </div>
            <Link to="/" className="button">
                Logout
            </Link>
        </nav>
    );
}

export default Navbar;