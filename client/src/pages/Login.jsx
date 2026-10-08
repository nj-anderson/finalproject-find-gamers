import { useState } from "react";
import "../styles/explore.css";
import { Navigate, useNavigate } from 'react-router-dom';
import useAuth from "../auth/useAuth";

function Login() {
    const navigate = useNavigate();
    const { user, login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [region, setRegion] = useState('NA');

    // Already logged in, so skip the login page
    if (user) {
        return <Navigate to="/home" replace />;
    }

    const handleClick = async () => {

        if (!username || !password) {
            alert("Please fill in both username and password");
            return;
        }

  try {
    // Logs in (or registers a new username) and saves the session
    const data = await login(username, password, region);

    if (data.success) {
      if (data.isNewUser) {
        alert("This account has now been registered.")
      }
      navigate('/home');
    } else {
      // Alert the message sent back by the backend server
      alert(data.message || 'Invalid credentials');
    }
  } catch (error) {
    console.error("Network connection error:", error);
    alert('Could not connect to the authentication server.');
  }
    };
    return (
        <main>
            <h1>Login</h1>
            <label htmlFor="username">Username:</label>
            <input type="text" id="username" name="username" placeholder="username" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)}></input>
            <label htmlFor="password">Password:</label>
            <input type="password" id="password" name="password" placeholder="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)}></input>
            <label htmlFor="region">Region:</label>
            <select id="region" value={region} onChange={(e) => setRegion(e.target.value)}>
                <option value="NA">North America (NA)</option>
                <option value="EU">Europe (EU)</option>
                <option value="ASIA">Asia (ASIA)</option>
                <option value="OCE">Oceania (OCE)</option>
            </select>
            <button type="button" onClick={handleClick}>Login</button>
        </main>
    );
}

export default Login;
