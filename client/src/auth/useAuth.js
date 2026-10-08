import { useContext } from "react";
import AuthContext from "./AuthContext";

/*
    const { user, login, logout } = useAuth();

    user is the logged-in user (with _id), or null.
*/
function useAuth() {
    return useContext(AuthContext);
}

export default useAuth;
