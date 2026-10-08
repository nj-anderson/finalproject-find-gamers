
import { Link } from "react-router-dom";
import "../styles/home.css";

function Home() {
  return (
    <main className="home-page">
      {/* Background decorations */}
      <div className="home-decoration decoration-one"></div>
      <div className="home-decoration decoration-two"></div>
      <div className="home-decoration decoration-three"></div>

      {/* Hero Section */}
      <section className="home-hero">
        <div className="home-hero-content">
          <div className="home-badge">
            ✨ Your gaming adventure starts here!
          </div>

          <h1 className="home-title">
            Gaming is better
            <br />
            <span>together! 🎮</span>
          </h1>

          <p className="home-description">
            Looking for your next gaming bestie?
            Find awesome people who love the same
            games as you. Make friends, build your
            dream squad, and let the fun begin!
          </p>

          <div className="home-buttons">
            <Link to="/explore" className="home-primary-btn">
              🎮 Find My Squad
            </Link>

            <Link to="/profile" className="home-secondary-btn">
              💜 My Profile
            </Link>
          </div>

          <div className="home-mini-message">
            🌈 Good games, great friends, happy vibes!
          </div>
        </div>

        {/* Decorative gaming card */}
        <div className="home-hero-art">
          <div className="home-art-card">
            <div className="art-top">
              <span>✨ PLAYER ONE</span>
              <span>● ONLINE</span>
            </div>

            <div className="art-avatar">
              🎮
            </div>

            <h2>Ready to Play?</h2>
            <p>Your next teammate is one click away!</p>

            <div className="art-avatars">
              <span>🐱</span>
              <span>🐸</span>
              <span>🦊</span>
              <span>🐼</span>
            </div>

            <div className="art-bottom">
              💖 Let's be gaming buddies!
            </div>
          </div>

          <div className="floating-emoji emoji-one">⭐</div>
          <div className="floating-emoji emoji-two">💜</div>
          <div className="floating-emoji emoji-three">🕹️</div>
        </div>
      </section>

      {/* Features Section */}
      <section className="home-features-section">
        <div className="home-section-heading">
          <span>🌟 THE FUN STARTS HERE</span>
          <h2>Find your people, find your fun!</h2>
          <p>
            Everything you need to make gaming more social.
          </p>
        </div>

        <div className="home-features">
          <div className="home-feature feature-pink">
            <div className="feature-icon">💖</div>
            <h3>Meet New Friends</h3>
            <p>
              Connect with gamers who share your
              interests and favorite games.
            </p>
          </div>

          <div className="home-feature feature-purple">
            <div className="feature-icon">🎮</div>
            <h3>Find Your Squad</h3>
            <p>
              Discover teammates and create
              unforgettable gaming memories.
            </p>
          </div>

          <div className="home-feature feature-mint">
            <div className="feature-icon">✨</div>
            <h3>Stay Connected</h3>
            <p>
              Build lasting friendships with
              your favorite gaming buddies.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="home-cta">
        <div className="home-cta-content">
          <span>🎉 READY, PLAYER ONE?</span>
          <h2>Your next adventure awaits!</h2>
          <p>
            Amazing friendships start with one hello.
            Go find your perfect gaming squad!
          </p>

          <Link to="/explore" className="home-cta-btn">
            Let's Go! 🚀
          </Link>
        </div>
      </section>
    </main>
  );
}

export default Home;
