import { createContext } from "react";

// Holds the logged-in user. Filled in by AuthProvider.
const AuthContext = createContext(null);

export default AuthContext;
