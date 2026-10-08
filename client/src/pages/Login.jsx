import { useState } from "react";
import { Navigate, useNavigate } from 'react-router-dom';
import { Gamepad2 } from "lucide-react";
import useAuth from "../auth/useAuth";
import "../styles/login.css";

function Login() {
    const navigate = useNavigate();
    const { user, login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [region, setRegion] = useState('NA');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Already logged in, so skip the login page
    if (user) {
        return <Navigate to="/home" replace />;
    }

    const handleSubmit = async (event) => {
        // A form submit, so pressing Enter logs in too
        event.preventDefault();
        setError('');

        if (!username || !password) {
            setError("Please fill in both username and password");
            return;
        }

        setSubmitting(true);

        try {
            // Logs in (or registers a new username) and saves the session
            const data = await login(username, password, region);

            if (data.success) {
                if (data.isNewUser) {
                    alert("This account has now been registered.")
                }
                navigate('/home');
                return;
            }

            // Show the message sent back by the backend server
            setError(data.message || 'Invalid credentials');
        } catch (error) {
            console.error("Network connection error:", error);
            setError('Could not connect to the authentication server.');
        }

        setSubmitting(false);
    };

    return (
        <main className="login-page">
            <form className="login-card" onSubmit={handleSubmit} noValidate>

                <div className="login-brand">
                    <span className="login-logo" aria-hidden="true">
                        <Gamepad2 size={26} />
                    </span>
                    <span>Find Gamers</span>
                </div>

                <h1>Login</h1>
                <p className="login-subtitle">
                    Find people to play your favorite games with.
                </p>

                {error && (
                    <div className="login-error" role="alert">
                        {error}
                    </div>
                )}

                <label htmlFor="username">Username</label>
                <input
                    type="text"
                    id="username"
                    name="username"
                    placeholder="username"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    aria-invalid={Boolean(error && !username)}
                    autoFocus
                />

                <label htmlFor="password">Password</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    aria-invalid={Boolean(error && !password)}
                />

                <label htmlFor="region">Region</label>
                <select
                    id="region"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    aria-describedby="login-hint"
                >
                    <option value="NA">North America (NA)</option>
                    <option value="EU">Europe (EU)</option>
                    <option value="ASIA">Asia (ASIA)</option>
                    <option value="OCE">Oceania (OCE)</option>
                </select>

                <button
                    type="submit"
                    className="login-submit"
                    disabled={submitting}
                >
                    {submitting ? "Logging in..." : "Login"}
                </button>

                <p className="login-hint" id="login-hint">
                    New here? Enter a new username and password to create
                    an account. Region is only used for new accounts.
                </p>
            </form>
        </main>
    );
}

export default Login;
