import { BrowserRouter, Routes, Route } from "react-router-dom";

import AuthProvider from "./auth/AuthProvider";
import Navbar from "./components/Navbar";
import RequireAuth from "./components/RequireAuth";
import ConditionalWrapper from "./components/conditionalwrapper";

import Home from "./pages/Home";
import Explore from "./pages/Explore";
import Profile from "./pages/Profile";
import Connections from "./pages/Connections";
import Login from "./pages/Login";

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <ConditionalWrapper>
                    <Navbar />
                </ConditionalWrapper>

                <Routes>
                    {/* Login (first page) */}
                    <Route
                        path="/"
                        element={<Login />}
                    />

                    {/* Home Page */}
                    <Route
                        path="/home"
                        element={
                            <RequireAuth>
                                <Home />
                            </RequireAuth>
                        }
                    />

                    {/* Explore Gamers */}
                    <Route
                        path="/explore"
                        element={
                            <RequireAuth>
                                <Explore />
                            </RequireAuth>
                        }
                    />

                    {/* Your Own Profile */}
                    <Route
                        path="/profile"
                        element={
                            <RequireAuth>
                                <Profile />
                            </RequireAuth>
                        }
                    />

                    {/* View Another User's Profile */}
                    <Route
                        path="/profile/:userId"
                        element={
                            <RequireAuth>
                                <Profile />
                            </RequireAuth>
                        }
                    />

                    {/* Connections / Friend Requests */}
                    <Route
                        path="/connections"
                        element={
                            <RequireAuth>
                                <Connections />
                            </RequireAuth>
                        }
                    />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
