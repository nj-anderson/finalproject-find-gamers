import { useEffect, useState } from "react";
import "../styles/explore.css";
import { useNavigate } from 'react-router-dom';

function Login() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const handleClick = async () => {
        
        if (!username || !password) {
            alert("Please fill in both username and password");
            return;
        }
        const payload = { username: username, password: password };

  try {
    // Fire the network request with mandatory Content-Type headers
    const response = await fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json' // CRITICAL: This tells Express to parse it!
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

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
  /**
        if (username === "admin" && password === "password") {
            navigate('/home'); 
            return;
        } else {
            alert("Invalid username or password");
            return;
        }
        */
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