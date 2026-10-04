import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import Profile from "./pages/Profile";
import Connections from "./pages/Connections";
import Login from "./pages/Login";
import ConditionalWrapper from "./components/conditionalwrapper";

function App() {
    return (
        <BrowserRouter>
            <ConditionalWrapper>
                <Navbar />
            </ConditionalWrapper>

            <Routes>
                <Route path="/home" element={<Home />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/connections" element={<Connections />} />
                <Route path="/" element={<Login />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;