import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Explore from "./pages/Explore";
import Profile from "./pages/Profile";
import Connections from "./pages/Connections";

function App() {
    return (
        <BrowserRouter>
            <Navbar />

            <Routes>
                {/* Home Page */}
                <Route
                    path="/"
                    element={<Home />}
                />

                {/* Explore Gamers */}
                <Route
                    path="/explore"
                    element={<Explore />}
                />

                {/* Your Own Profile */}
                <Route
                    path="/profile"
                    element={<Profile />}
                />

                {/* View Another User's Profile */}
                <Route
                    path="/profile/:userId"
                    element={<Profile />}
                />

                {/* Connections / Friend Requests */}
                <Route
                    path="/connections"
                    element={<Connections />}
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;