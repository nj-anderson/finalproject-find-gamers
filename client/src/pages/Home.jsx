
import { Link } from "react-router-dom";
import "../styles/home.css";

function Home() {
  return (
    <main className="home-page">
      <section className="home-container">

        <p className="home-label">FIND GAMERS</p>

        <h1 className="home-title">
          Find your next <span>teammate.</span>
        </h1>

        <p className="home-description">
          Connect with gamers who share your interests,
          discover new teammates, and build lasting
          friendships.
        </p>

        <div className="home-buttons">
          <Link to="/explore" className="home-primary-btn">
            Explore Gamers
          </Link>

          <Link to="/profile" className="home-secondary-btn">
            My Profile
          </Link>
        </div>

        <div className="home-features">
          <div className="home-feature feature-pink">
            <h3>Discover</h3>
            <p>
              Find people who share your gaming interests.
            </p>
          </div>

          <div className="home-feature feature-purple">
            <h3>Connect</h3>
            <p>
              Meet new players and make friends.
            </p>
          </div>

          <div className="home-feature feature-mint">
            <h3>Play</h3>
            <p>
              Enjoy your favorite games together.
            </p>
          </div>
        </div>

      </section>
    </main>
  );
}

export default Home;
