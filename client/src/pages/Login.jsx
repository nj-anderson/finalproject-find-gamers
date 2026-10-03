import { useEffect, useState } from "react";
import "../styles/explore.css";
import { useNavigate } from 'react-router-dom';

function Login() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const handleClick = () => {
        
        if (!username || !password) {
            alert("Please fill in both username and password");
            return;
        }
        if (username === "admin" && password === "password") {
            // Successful login logic here
            navigate('/home'); 
            return;
        } else {
            alert("Invalid username or password");
            return;
        }
        
    };
    return (
        <main>
            <h1>Login</h1>
            <label htmlFor="username">Username:</label>
            <input type="text" id="username" name="username" placeholder="username" value={username} onChange={(e) => setUsername(e.target.value)}></input>
            <label htmlFor="password">Username:</label>
            <input type="text" id="password" name="password" placeholder="password" value={password} onChange={(e) => setPassword(e.target.value)}></input>
            <button type="button" onClick={handleClick}>Login</button>
        </main>
    );
}

export default Login;