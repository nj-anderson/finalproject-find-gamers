import { Link } from "react-router-dom";
import "../styles/home.css";

function Home() {
    return (
        <main>
            <h1>Find Gamers</h1>
            <p>Find people to play your favorite games with.</p>

            <Link to="/explore" className="button">
                Explore Gamers
            </Link>
        </main>
    );
}

export default Home;