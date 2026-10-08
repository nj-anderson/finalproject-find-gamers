import { useEffect, useState } from "react";
import AuthContext from "./AuthContext";

function AuthProvider({ children }) {
    const [user, setUser] = useState(null);

    // True until we know whether someone is already logged in
    const [loading, setLoading] = useState(true);

    // The session cookie survives page reloads, so ask the server who we are
    useEffect(() => {
        fetch("/api/auth/me")
            .then((response) => (response.ok ? response.json() : null))
            .then((data) => {
                setUser(data);
                setLoading(false);
            })
            .catch(() => {
                setUser(null);
                setLoading(false);
            });
    }, []);

    /*
        Logs in (or creates the account if the username is new).
        Returns the server's response so the Login page can
        show its message, e.g. when a new account was created.
    */
    async function login(username, password, region) {
        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password, region })
        });

        const data = await response.json();

        if (data.success) {
            setUser(data.user);
        }

        return data;
    }

    async function logout() {
        await fetch("/api/auth/logout", { method: "POST" });
        setUser(null);
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                logout,
                // Lets pages update the user after editing their profile
                setUser
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export default AuthProvider;
