import { Navigate } from "react-router-dom";
import useAuth from "../auth/useAuth";

/*
    Wrap a page in this to make it login-only.
    Logged-out users are sent to the Login page.
*/
function RequireAuth({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <main>
                <p role="status">Loading...</p>
            </main>
        );
    }

    if (!user) {
        return <Navigate to="/" replace />;
    }

    return children;
}

export default RequireAuth;
