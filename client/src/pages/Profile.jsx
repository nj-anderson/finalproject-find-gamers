import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Gamepad2, MapPin } from "lucide-react";
import ConnectButton from "../components/ConnectButton";
import useAuth from "../auth/useAuth";
import "../styles/profile.css";
import "../styles/pastel-theme.css";

const emptyGame = {
    name: "",
    rank: "",
    role: "",
    playstyle: "",
    lookingForTeammates: false
};

function Profile() {
    const { userId } = useParams();

    const [profile, setProfile] = useState(null);
    const [form, setForm] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [editing, setEditing] = useState(false);

    // This page is login-only, so user is always set
    const { user, setUser } = useAuth();
    const currentUserId = user._id;

    // /profile = your own profile
    // /profile/:userId = another user's profile
    const viewedUserId = userId || currentUserId;

    const isOwnProfile = viewedUserId === currentUserId;

    useEffect(() => {
        setLoading(true);
        setError("");

        // The server uses the login session to decide whether
        // to include gamertags (only for you or your connections)
        fetch(`/api/users/${viewedUserId}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Could not load this profile.");
                }

                return response.json();
            })
            .then((data) => {
                setProfile(data);
                setForm(normalizeProfile(data));
                setLoading(false);
            })
            .catch((error) => {
                console.error(error);
                setError(error.message);
                setLoading(false);
            });
    }, [viewedUserId]);

    // Reloads the profile without the loading screen,
    // e.g. after connecting so their gamertags show up
    function refreshProfile() {
        fetch(`/api/users/${viewedUserId}`)
            .then((response) => (response.ok ? response.json() : null))
            .then((data) => {
                if (data) {
                    setProfile(data);
                    setForm(normalizeProfile(data));
                }
            })
            .catch((error) => console.error(error));
    }

    const initials = useMemo(() => {
        if (!profile?.username) {
            return "?";
        }

        return profile.username.slice(0, 2).toUpperCase();
    }, [profile]);

    function normalizeProfile(data) {
        return {
            username: data.username || "",
            profilePicture: data.profilePicture || "",
            bio: data.bio || "",
            region: data.region || "",

            platforms: data.platforms || [],

            gamertags: {
                discord: data.gamertags?.discord || "",
                steam: data.gamertags?.steam || "",
                xbox: data.gamertags?.xbox || "",
                playstation: data.gamertags?.playstation || ""
            },

            games: (data.games || []).map((game) => ({
                ...emptyGame,
                ...game,
                rank: game.rank || "",
                role: game.role || "",
                playstyle: game.playstyle || ""
            }))
        };
    }

    function updateField(event) {
        const { name, value } = event.target;

        setForm((oldForm) => ({
            ...oldForm,
            [name]: value
        }));
    }

    function togglePlatform(platform) {
        setForm((oldForm) => ({
            ...oldForm,

            platforms: oldForm.platforms.includes(platform)
                ? oldForm.platforms.filter(
                      (currentPlatform) => currentPlatform !== platform
                  )
                : [...oldForm.platforms, platform]
        }));
    }

    function updateGamertag(type, value) {
        setForm((oldForm) => ({
            ...oldForm,

            gamertags: {
                ...oldForm.gamertags,
                [type]: value
            }
        }));
    }

    function updateGame(index, field, value) {
        setForm((oldForm) => ({
            ...oldForm,

            games: oldForm.games.map((game, currentIndex) =>
                currentIndex === index
                    ? {
                          ...game,
                          [field]: value
                      }
                    : game
            )
        }));
    }

    function addGame() {
        setForm((oldForm) => ({
            ...oldForm,
            games: [...oldForm.games, { ...emptyGame }]
        }));
    }

    function removeGame(index) {
        setForm((oldForm) => ({
            ...oldForm,

            games: oldForm.games.filter(
                (_, currentIndex) => currentIndex !== index
            )
        }));
    }

    async function saveProfile(event) {
        event.preventDefault();

        setMessage("");
        setError("");

        try {
            const response = await fetch(
                `/api/users/${viewedUserId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(form)
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Could not save profile."
                );
            }

            setProfile(data);
            setForm(normalizeProfile(data));
            setEditing(false);

            // Keeps the logged-in user up to date (e.g. a new username)
            setUser(data);

            setMessage("Profile saved!");
        } catch (error) {
            setError(error.message);
        }
    }

    if (loading) {
        return (
            <main className="profile-page">
                <p>Loading profile...</p>
            </main>
        );
    }

    if (error && !profile) {
        return (
            <main className="profile-page">
                <div className="profile-alert error">
                    {error}
                </div>
            </main>
        );
    }

    if (!profile || !form) {
        return null;
    }

    return (
        <main className="profile-page">

            {/* PROFILE HEADER */}

            <section className="profile-hero">

                <div className="profile-avatar">
                    {profile.profilePicture ? (
                        <img
                            src={profile.profilePicture}
                            alt={`${profile.username}'s profile`}
                        />
                    ) : (
                        <span>{initials}</span>
                    )}
                </div>

                <div className="profile-heading">

                    <p className="profile-label">
                        GAMER PROFILE
                    </p>

                    <h1>{profile.username}</h1>

                    <p>
                        {profile.bio || "No bio yet."}
                    </p>

                    <div className="profile-meta">

                        <span>
                            <MapPin size={16} aria-hidden="true" />
                            <span className="sr-only">Region: </span>
                            {profile.region || "No region"}
                        </span>

                        <span>
                            <Gamepad2 size={16} aria-hidden="true" />
                            <span className="sr-only">Platforms: </span>
                            {profile.platforms.length
                                ? profile.platforms.join(" · ")
                                : "No platforms listed"}
                        </span>

                    </div>

                </div>

                {isOwnProfile && !editing && (
                    <button
                        className="profile-primary"
                        onClick={() => setEditing(true)}
                    >
                        Edit Profile
                    </button>
                )}

                {!isOwnProfile && (
                    <ConnectButton
                        key={viewedUserId}
                        userId={viewedUserId}
                        username={profile.username}
                        onConnected={refreshProfile}
                    />
                )}

            </section>

            {message && (
                <div className="profile-alert success">
                    {message}
                </div>
            )}

            {error && (
                <div className="profile-alert error">
                    {error}
                </div>
            )}

            {/* EDIT PROFILE */}

            {editing && isOwnProfile ? (

                <form
                    className="profile-edit"
                    onSubmit={saveProfile}
                >

                    <section className="profile-card">

                        <h2>Edit Profile</h2>

                        <div className="profile-form-grid">

                            <label>
                                Username

                                <input
                                    name="username"
                                    value={form.username}
                                    onChange={updateField}
                                    required
                                />
                            </label>

                            <label>
                                Region

                                <input
                                    name="region"
                                    value={form.region}
                                    onChange={updateField}
                                    required
                                />
                            </label>

                            <label className="profile-full">
                                Profile Picture URL

                                <input
                                    name="profilePicture"
                                    value={form.profilePicture}
                                    onChange={updateField}
                                    placeholder="https://..."
                                />
                            </label>

                            <label className="profile-full">
                                Bio

                                <textarea
                                    name="bio"
                                    value={form.bio}
                                    onChange={updateField}
                                    maxLength="300"
                                    rows="4"
                                />
                            </label>

                        </div>

                        <h3>Platforms</h3>

                        <div className="platform-options">

                            {[
                                "PC",
                                "PlayStation",
                                "Xbox",
                                "Nintendo Switch",
                                "Mobile"
                            ].map((platform) => (

                                <label
                                    className="platform-check"
                                    key={platform}
                                >

                                    <input
                                        type="checkbox"
                                        checked={form.platforms.includes(
                                            platform
                                        )}
                                        onChange={() =>
                                            togglePlatform(platform)
                                        }
                                    />

                                    {platform}

                                </label>

                            ))}

                        </div>

                    </section>

                    {/* GAMERTAGS */}

                    <section className="profile-card">

                        <h2>Gamertags</h2>

                        <div className="profile-form-grid">

                            {Object.entries(form.gamertags).map(
                                ([type, value]) => (

                                    <label key={type}>

                                        {type[0].toUpperCase() +
                                            type.slice(1)}

                                        <input
                                            value={value}
                                            onChange={(event) =>
                                                updateGamertag(
                                                    type,
                                                    event.target.value
                                                )
                                            }
                                        />

                                    </label>

                                )
                            )}

                        </div>

                    </section>

                    {/* GAMES */}

                    <section className="profile-card">

                        <div className="profile-section-heading">

                            <h2>Games</h2>

                            <button
                                type="button"
                                className="profile-secondary"
                                onClick={addGame}
                            >
                                + Add Game
                            </button>

                        </div>

                        {form.games.map((game, index) => (

                            <div
                                className="game-editor"
                                key={index}
                            >

                                <div className="profile-form-grid">

                                    <label>
                                        Game

                                        <input
                                            value={game.name}
                                            onChange={(event) =>
                                                updateGame(
                                                    index,
                                                    "name",
                                                    event.target.value
                                                )
                                            }
                                            required
                                        />
                                    </label>

                                    <label>
                                        Rank

                                        <input
                                            value={game.rank}
                                            onChange={(event) =>
                                                updateGame(
                                                    index,
                                                    "rank",
                                                    event.target.value
                                                )
                                            }
                                        />
                                    </label>

                                    <label>
                                        Role

                                        <input
                                            value={game.role}
                                            onChange={(event) =>
                                                updateGame(
                                                    index,
                                                    "role",
                                                    event.target.value
                                                )
                                            }
                                        />
                                    </label>

                                    <label>
                                        Playstyle

                                        <input
                                            value={game.playstyle}
                                            onChange={(event) =>
                                                updateGame(
                                                    index,
                                                    "playstyle",
                                                    event.target.value
                                                )
                                            }
                                        />
                                    </label>

                                </div>

                                <div className="game-editor-bottom">

                                    <label className="platform-check">

                                        <input
                                            type="checkbox"
                                            checked={
                                                game.lookingForTeammates
                                            }
                                            onChange={(event) =>
                                                updateGame(
                                                    index,
                                                    "lookingForTeammates",
                                                    event.target.checked
                                                )
                                            }
                                        />

                                        Looking for teammates

                                    </label>

                                    <button
                                        type="button"
                                        className="danger-button"
                                        onClick={() =>
                                            removeGame(index)
                                        }
                                    >
                                        Remove
                                    </button>

                                </div>

                            </div>

                        ))}

                    </section>

                    <div className="profile-actions">

                        <button
                            type="button"
                            className="profile-secondary"
                            onClick={() => {
                                setForm(
                                    normalizeProfile(profile)
                                );

                                setEditing(false);
                            }}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="profile-primary"
                        >
                            Save Profile
                        </button>

                    </div>

                </form>

            ) : (

                /* NORMAL PROFILE VIEW */

                <div className="profile-content">

                    <section className="profile-card">

                        <h2>Games</h2>

                        {profile.games?.length ? (

                            <div className="games-grid">

                                {profile.games.map((game, index) => (

                                    <article
                                        className="game-card"
                                        key={index}
                                    >

                                        <div className="game-title-row">

                                            <h3>{game.name}</h3>

                                            {game.lookingForTeammates && (
                                                <span className="looking-badge">
                                                    Looking for teammates
                                                </span>
                                            )}

                                        </div>

                                        <dl>

                                            <dt>Rank</dt>
                                            <dd>
                                                {game.rank || "Not listed"}
                                            </dd>

                                            <dt>Role</dt>
                                            <dd>
                                                {game.role || "Not listed"}
                                            </dd>

                                            <dt>Playstyle</dt>
                                            <dd>
                                                {game.playstyle ||
                                                    "Not listed"}
                                            </dd>

                                        </dl>

                                    </article>

                                ))}

                            </div>

                        ) : (
                            <p>No games listed yet.</p>
                        )}

                    </section>

                    {/* GAMERTAGS DISPLAY */}

                    <section className="profile-card">

                        <h2>Gamertags</h2>

                        <div className="gamertag-list">

                            {Object.entries(
                                profile.gamertags || {}
                            )
                                .filter(([, value]) => value)
                                .map(([type, value]) => (

                                    <div
                                        className="gamertag"
                                        key={type}
                                    >

                                        <span>{type}</span>

                                        <strong>{value}</strong>

                                    </div>

                                ))}

                            {/* The server leaves gamertags out
                                unless you are connected */}
                            {!profile.gamertags ? (
                                <p>Connect with {profile.username} to see their gamertags.</p>
                            ) : !Object.values(
                                profile.gamertags
                            ).some(Boolean) && (
                                <p>No gamertags listed yet.</p>
                            )}

                        </div>

                    </section>

                </div>

            )}

        </main>
    );
}

export default Profile;