
import React, { useEffect, useMemo, useState } from "react";
import {
  Routes, Route, NavLink, Link, useNavigate, useParams
} from "react-router-dom";
import {
  Lightbulb, LayoutDashboard, Compass, Plus, Trophy, Medal,
  UserRound, Bell, Search, Sparkles, Heart, MessageCircle, Eye,
  LockKeyhole, Unlock, ArrowUp, ArrowRight, Zap, CheckCircle2,
  Settings as SettingsIcon, SlidersHorizontal, ChevronDown, Send,
  Clock3, Users, Award, BarChart3, X
} from "lucide-react";

const API_URL = "https://obituaries-meal-eliminate-helicopter.trycloudflare.com/api";

const seedIdeas = [
  {
    id: 1, title: "AI Meeting Notes Summarizer", category: "Productivity",
    description: "Turn long meeting conversations into clear summaries, decisions and action items.",
    solution: "Use React for the dashboard, Spring Boot for APIs, speech-to-text for transcripts and an AI service to extract decisions and action items.",
    author: "Jamie Scott", avatar: "JS", points: 1274, likes: 842, comments: 43, views: 3840,
    status: "Trending", difficulty: "Medium", tags: ["AI", "Productivity", "Automation"], color: "coral"
  },
  {
    id: 2, title: "Employee Kudos Wall", category: "Culture",
    description: "A lightweight recognition wall where teams celebrate helpful work and collaboration.",
    solution: "Create team spaces, kudos posts, reactions and monthly recognition statistics. Store users, posts and reactions in MySQL.",
    author: "Alicia Lee", avatar: "AL", points: 982, likes: 612, comments: 28, views: 2450,
    status: "Trending", difficulty: "Low", tags: ["Community", "Team"], color: "gold"
  },
  {
    id: 3, title: "Dark Mode for Web Apps", category: "UX",
    description: "A reusable theme engine that remembers user preferences and improves long-session comfort.",
    solution: "Use CSS variables and a React context for themes. Persist the selected theme in localStorage and respect system preferences.",
    author: "Devon Martinez", avatar: "DM", points: 876, likes: 498, comments: 31, views: 1910,
    status: "Under review", difficulty: "Low", tags: ["UX", "Frontend"], color: "blue"
  },
  {
    id: 4, title: "Improved Search Relevance", category: "Productivity",
    description: "Help users find the right document faster using tags, fuzzy matching and relevance scoring.",
    solution: "Index title, description and tags. Combine exact matches, prefix matches and popularity into a weighted relevance score.",
    author: "Sarah Rodriguez", avatar: "SR", points: 765, likes: 421, comments: 19, views: 1680,
    status: "Accepted", difficulty: "High", tags: ["Search", "Data"], color: "coral"
  },
  {
    id: 5, title: "Mobile App Time Tracking", category: "Process",
    description: "Track focus sessions and turn usage patterns into simple productivity insights.",
    solution: "Capture session start/end events, aggregate by day and display trends with a lightweight analytics dashboard.",
    author: "Chloe Patel", avatar: "CP", points: 642, likes: 318, comments: 14, views: 1220,
    status: "New", difficulty: "Medium", tags: ["Mobile", "Analytics"], color: "mint"
  },
  {
    id: 6, title: "Template Library", category: "Engineering",
    description: "A shared library for reusable project templates, checklists and starter workflows.",
    solution: "Store templates with categories and versions. Add permissions, favorites and a download counter.",
    author: "Noah Chen", avatar: "NC", points: 581, likes: 287, comments: 12, views: 1030,
    status: "New", difficulty: "Medium", tags: ["Templates", "Engineering"], color: "violet"
  }
];

const initialUser = {
  id: null,
  name: "",
  email: "",
  username: "",
  bio: "",
  role: "Contributor",
  points: 0,
  ideas: 0,
  likes: 0,
  saved: 0,
  level: 1,
  unlocked: 0,
  avatar: ""
};

async function ensureBackendUser(user) {
  let response;
  try {
    response = await fetch(`${API_URL}/users`);
  } catch {
    throw new Error("Cannot connect to the backend. Start Spring Boot and MySQL, then try again.");
  }

  if (!response.ok) {
    throw new Error(`Could not load backend users (HTTP ${response.status}).`);
  }

  const users = await response.json();
  if (!Array.isArray(users)) {
    throw new Error("The backend returned an invalid user list.");
  }

  let backendUser = users.find(
    item => (item.email || "").toLowerCase() === user.email.toLowerCase()
  );

  if (!backendUser) {
    try {
      response = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: user.name,
          email: user.email,
          bio: user.bio
        })
      });
    } catch {
      throw new Error("Cannot connect to the backend. Start Spring Boot and MySQL, then try again.");
    }

    if (!response.ok) {
      throw new Error(`Could not create your backend profile (HTTP ${response.status}).`);
    }

    backendUser = await response.json();
  }

  if (!Number.isInteger(backendUser.id)) {
    throw new Error("The backend returned an invalid user ID.");
  }

  return {
    ...user,
    id: backendUser.id,
    points: backendUser.contributionPoints ?? user.points,
    ideas: backendUser.ideasCount ?? user.ideas,
    username: backendUser.username || user.username,
    bio: backendUser.bio || user.bio
  };
}

function getIdeas() {
  try {
    const saved = JSON.parse(localStorage.getItem("ideahub_ideas"));
    return Array.isArray(saved) && saved.length ? saved : seedIdeas;
  } catch {
    return seedIdeas;
  }
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("ideahub_user")) || initialUser;
  } catch {
    return initialUser;
  }
}

function getColor(category) {
  const value = (category || "").toLowerCase();
  if (value.includes("ux") || value.includes("design")) return "coral";
  if (value.includes("education") || value.includes("culture")) return "gold";
  if (value.includes("engineering") || value.includes("ai")) return "blue";
  if (value.includes("environment") || value.includes("process")) return "mint";
  return "violet";
}

function normalizeIdea(item) {
  const author = item.author || {};
  const authorName = typeof author === "string"
    ? author
    : (author.name || "Community contributor");

  const avatar = typeof author === "string"
    ? author.split(" ").map(x => x[0]).join("").slice(0, 2).toUpperCase()
    : authorName.split(" ").map(x => x[0]).join("").slice(0, 2).toUpperCase();

  return {
    ...item,
    author: authorName,
    authorId: typeof author === "object" ? author.id : undefined,
    avatar,
    points: typeof author === "object" ? (author.contributionPoints || 0) : 0,
    comments: item.comments || 0,
    difficulty: item.difficulty || "Medium",
    tags: Array.isArray(item.tags) && item.tags.length
      ? item.tags
      : [item.category || "Idea"],
    color: item.color || getColor(item.category),
    status: item.status || "NEW"
  };
}

/* -------------------------------------------------
   WELCOME, LOGIN AND SIGN UP
   ------------------------------------------------- */

function WelcomeAuth({ onComplete }) {
  const [page, setPage] = useState("welcome");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!email.trim() || !password.trim()) {
      setMessage("Please enter your email and password.");
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    setSubmitting(true);

    try {
      const accounts = JSON.parse(
        localStorage.getItem("ideahub_accounts") || "[]"
      );
      let localUser;

      if (page === "signup") {
        if (!name.trim()) {
          setMessage("Please enter your full name.");
          return;
        }

        const existingUser = accounts.find(
          account => account.email.toLowerCase() === normalizedEmail
        );

        if (existingUser) {
          setMessage("An account with this email already exists. Please log in.");
          return;
        }

        localUser = {
          ...initialUser,
          name: name.trim(),
          email: normalizedEmail,
          username: normalizedEmail.split("@")[0],
          bio: "Building useful ideas and learning with the community.",
          avatar: name.trim().split(/\s+/)
            .map(word => word[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()
        };
      } else {
        const existingUser = accounts.find(
          account =>
            account.email.toLowerCase() === normalizedEmail &&
            account.password === password
        );

        if (!existingUser) {
          setMessage("Account not found or password is incorrect. Please sign up first.");
          return;
        }

        const { password: savedPassword, ...accountUser } = existingUser;
        localUser = accountUser;
      }

      const newUser = await ensureBackendUser(localUser);
      const updatedAccounts = page === "signup"
        ? [...accounts, { ...newUser, password }]
        : accounts.map(account => account.email.toLowerCase() === normalizedEmail
          ? { ...newUser, password: account.password }
          : account);

      localStorage.setItem("ideahub_accounts", JSON.stringify(updatedAccounts));
      localStorage.setItem("ideahub_user", JSON.stringify(newUser));
      localStorage.setItem("ideahub_authenticated", "true");
      onComplete(newUser);
    } catch (error) {
      console.error("Could not connect account to IDEAHUB:", error);
      setMessage(error instanceof Error ? error.message : "Could not connect your account to IDEAHUB.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <style>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 28px 16px;
          box-sizing: border-box;
          background:
            radial-gradient(circle at 15% 15%, rgba(132, 100, 220, .18), transparent 35%),
            radial-gradient(circle at 85% 85%, rgba(82, 160, 235, .16), transparent 35%),
            #f7f6fc;
          color: #25223a;
          font-family: Inter, system-ui, sans-serif;
        }
        .auth-card {
          width: 100%;
          max-width: 460px;
          padding: 38px;
          border: 1px solid #e9e5f2;
          border-radius: 24px;
          background: white;
          box-shadow: 0 24px 70px rgba(47, 34, 91, .10);
          box-sizing: border-box;
        }
        .auth-brand {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
          margin-bottom: 32px;
          font-size: 22px;
          font-weight: 850;
          letter-spacing: -1px;
        }
        .auth-brand span span { color: #8161d5; }
        .auth-logo {
          display: grid;
          place-items: center;
          width: 43px;
          height: 43px;
          border-radius: 14px;
          color: white;
          background: linear-gradient(135deg, #8064dc, #5b88e9);
        }
        .auth-eyebrow {
          margin-bottom: 10px;
          color: #8064dc;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 2px;
          text-align: center;
        }
        .auth-card h1 {
          margin: 0 0 12px;
          font-size: clamp(27px, 5vw, 34px);
          line-height: 1.2;
          letter-spacing: -1px;
          text-align: center;
        }
        .auth-description {
          margin: 0 auto 26px;
          max-width: 340px;
          color: #77758b;
          font-size: 14px;
          line-height: 1.7;
          text-align: center;
        }
        .auth-feature-list {
          display: grid;
          gap: 12px;
          margin: 24px 0;
          padding: 0;
          list-style: none;
        }
        .auth-feature-list li {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 13px;
          border: 1px solid #eeeaf7;
          border-radius: 13px;
          background: #fbfaff;
          color: #514b69;
          font-size: 13px;
        }
        .auth-feature-icon {
          display: grid;
          place-items: center;
          flex-shrink: 0;
          width: 34px;
          height: 34px;
          border-radius: 10px;
          background: #eee9ff;
          color: #7457cc;
        }
        .auth-form { display: grid; gap: 15px; }
        .auth-form label {
          display: grid;
          gap: 7px;
          color: #4b4760;
          font-size: 12px;
          font-weight: 700;
        }
        .auth-form input {
          width: 100%;
          min-height: 45px;
          padding: 11px 13px;
          border: 1px solid #e3dfec;
          border-radius: 11px;
          box-sizing: border-box;
          outline: none;
          background: white;
          color: #29263d;
          font: inherit;
          font-size: 14px;
        }
        .auth-form input:focus {
          border-color: #8a70df;
          box-shadow: 0 0 0 3px rgba(138, 112, 223, .12);
        }
        .auth-primary, .auth-secondary {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          width: 100%;
          min-height: 47px;
          padding: 12px 16px;
          border-radius: 12px;
          box-sizing: border-box;
          cursor: pointer;
          font: inherit;
          font-size: 14px;
          font-weight: 750;
          text-decoration: none;
          transition: transform .15s ease, opacity .15s ease;
        }
        .auth-primary {
          margin-top: 4px;
          border: 0;
          color: white;
          background: linear-gradient(135deg, #8064dc, #637ee5);
          box-shadow: 0 7px 18px rgba(109, 92, 202, .22);
        }
        .auth-secondary {
          border: 1px solid #e3def2;
          color: #6851b6;
          background: white;
        }
        .auth-primary:hover, .auth-secondary:hover { transform: translateY(-1px); }
        .auth-switch {
          margin-top: 21px;
          color: #77758b;
          font-size: 13px;
          text-align: center;
        }
        .auth-link {
          padding: 0;
          border: 0;
          background: none;
          color: #7659ce;
          cursor: pointer;
          font: inherit;
          font-weight: 800;
        }
        .auth-error {
          padding: 10px 12px;
          border-radius: 10px;
          background: #fff0f0;
          color: #b33b46;
          font-size: 12px;
        }
        .auth-footer {
          margin-top: 25px;
          color: #aaa6ba;
          font-size: 11px;
          text-align: center;
          line-height: 1.6;
        }
        .auth-back {
          display: block;
          margin: 0 auto 22px;
          padding: 0;
          border: 0;
          background: none;
          color: #77758b;
          cursor: pointer;
          font: inherit;
          font-size: 12px;
        }
        @media (max-width: 480px) {
          .auth-card { padding: 26px 20px; }
        }
      `}</style>

      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-logo"><Lightbulb size={24} /></div>
          <span>IDEA<span>HUB</span></span>
        </div>

        {page === "welcome" && (
          <>
            <div className="auth-eyebrow">YOUR CREATIVE WORKSPACE</div>
            <h1>Big ideas start here. 💡</h1>
            <p className="auth-description">
              Share ideas, collaborate with your community, and turn
              your creativity into something meaningful.
            </p>

            <ul className="auth-feature-list">
              <li>
                <span className="auth-feature-icon"><Lightbulb size={18}/></span>
                <span><b>Share your ideas</b><br/>Give your creativity a place to grow.</span>
              </li>
              <li>
                <span className="auth-feature-icon"><Users size={18}/></span>
                <span><b>Build together</b><br/>Discover ideas from other contributors.</span>
              </li>
              <li>
                <span className="auth-feature-icon"><Trophy size={18}/></span>
                <span><b>Earn contribution points</b><br/>Grow your reputation as you contribute.</span>
              </li>
            </ul>

            <button className="auth-primary" onClick={() => setPage("signup")}>
              Create your account <ArrowRight size={17}/>
            </button>
            <button className="auth-secondary" style={{marginTop: 11}} onClick={() => setPage("login")}>
              Login to IDEAHUB
            </button>
          </>
        )}

        {(page === "login" || page === "signup") && (
          <>
            <button className="auth-back" onClick={() => { setPage("welcome"); setMessage(""); }}>
              ← Back to welcome
            </button>

            <div className="auth-eyebrow">
              {page === "login" ? "WELCOME BACK" : "JOIN THE COMMUNITY"}
            </div>
            <h1>{page === "login" ? "Login to IdeaHub" : "Create your account"}</h1>
            <p className="auth-description">
              {page === "login"
                ? "Continue discovering and sharing great ideas."
                : "Start sharing your ideas and collaborating today."}
            </p>

            <form className="auth-form" onSubmit={handleSubmit}>
              {page === "signup" && (
                <label>
                  Full name
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    required
                  />
                </label>
              )}

              <label>
                Email address
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </label>

              <label>
                Password
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete={page === "login" ? "current-password" : "new-password"}
                  minLength={6}
                  required
                />
              </label>

              {message && <div className="auth-error">{message}</div>}

              <button className="auth-primary" type="submit" disabled={submitting}>
                {submitting ? "Connecting..." : page === "login" ? "Login" : "Create account"} <ArrowRight size={17}/>
              </button>
            </form>

            <div className="auth-switch">
              {page === "login" ? "New to IdeaHub? " : "Already have an account? "}
              <button className="auth-link" onClick={() => {
                setPage(page === "login" ? "signup" : "login");
                setMessage("");
              }}>
                {page === "login" ? "Sign up" : "Login"}
              </button>
            </div>
          </>
        )}

        <div className="auth-footer">
          IDEA HUB · SHARE IDEAS · BUILD TOGETHER
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------
   MAIN APPLICATION
   ------------------------------------------------- */

function App() {
  const [ideas, setIdeas] = useState(getIdeas);
  const [user, setUser] = useState(getUser);
  const [notifications, setNotifications] = useState(3);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem("ideahub_authenticated") === "true"
  );

  const handleLogout = () => {
    localStorage.removeItem("ideahub_authenticated");
    setIsAuthenticated(false);
  };

  const refreshData = async () => {
    try {
      const [ideasResponse, usersResponse] = await Promise.all([
        fetch(`${API_URL}/ideas`),
        fetch(`${API_URL}/users`)
      ]);

      if (!ideasResponse.ok || !usersResponse.ok) {
        throw new Error("API request failed");
      }

      const ideaData = await ideasResponse.json();
      const users = await usersResponse.json();
      const signedInEmail = (getUser().email || "").toLowerCase();
      const backendUser = Array.isArray(users)
        ? users.find(item => (item.email || "").toLowerCase() === signedInEmail)
        : null;

      // Sync only the backend account that matches the signed-in email.
      // Never replace the signed-in user with the first user in the database.
      if (backendUser) {
        setUser(prev => ({
          ...prev,
          id: backendUser.id,
          name: backendUser.name || prev.name,
          email: backendUser.email || prev.email,
          username: backendUser.username || prev.username,
          bio: backendUser.bio || prev.bio,
          points: backendUser.contributionPoints ?? prev.points,
          ideas: backendUser.ideasCount ?? prev.ideas,
          avatar: (backendUser.name || prev.name || "User")
            .split(/\s+/).map(x => x[0]).join("").slice(0, 2).toUpperCase()
        }));
      }

      setIdeas(ideaData.map(normalizeIdea));
    } catch (error) {
      console.error("Could not load IDEAHUB data:", error);
      if (!ideas.length) setIdeas(seedIdeas);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    localStorage.setItem("ideahub_user", JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem("ideahub_ideas", JSON.stringify(ideas));
  }, [ideas]);

  const addIdea = async (idea) => {
    if (!user.id) {
      alert("No IDEAHUB user is connected yet.");
      return false;
    }

    try {
      let response;
      try {
        response = await fetch(`${API_URL}/ideas`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            authorId: user.id,
            title: idea.title,
            description: idea.description,
            solution: idea.solution,
            category: idea.category
          })
        });
      } catch {
        throw new Error("Cannot connect to the backend. Start Spring Boot and MySQL, then try again.");
      }

      if (!response.ok) {
        throw new Error(`Could not create idea (HTTP ${response.status}).`);
      }

      const savedIdea = normalizeIdea(await response.json());
      setIdeas(prev => [savedIdea, ...prev]);

      setUser(prev => ({
        ...prev,
        points: prev.points + 25,
        ideas: prev.ideas + 1
      }));

      return true;
    } catch (error) {
      console.error(error);
      alert(error instanceof Error
        ? error.message
        : "Could not publish the idea.");
      return false;
    }
  };

  const likeIdea = async (id) => {
    try {
      const response = await fetch(`${API_URL}/ideas/${id}/like`, {
        method: "POST"
      });

      if (!response.ok) throw new Error("Could not like idea");

      const updated = normalizeIdea(await response.json());
      setIdeas(prev => prev.map(i => i.id === id ? updated : i));
    } catch (error) {
      console.error(error);
      alert("Could not like this idea. Make sure Spring Boot is running.");
    }
  };

  // Show the welcome/login/signup flow before the main application.
  if (!isAuthenticated) {
    return (
      <WelcomeAuth
        onComplete={(newUser) => {
          setUser(newUser);
          setIsAuthenticated(true);
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="app-shell">
        <div className="content">
          <div className="empty">
            <Lightbulb size={38}/>
            <h3>Loading IDEAHUB...</h3>
            <p>Connecting to your Spring Boot + MySQL backend.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Sidebar user={user} onLogout={handleLogout}/>

      <main className="main-area">
        <Topbar
          user={user}
          notifications={notifications}
          clearNotifications={() => setNotifications(0)}
          onLogout={handleLogout}
        />

        <Routes>
          <Route path="/" element={<Dashboard ideas={ideas} user={user} likeIdea={likeIdea}/>}/>
          <Route path="/discover" element={<Discover ideas={ideas} likeIdea={likeIdea}/>}/>
          <Route path="/ideas" element={<MyIdeas ideas={ideas} user={user} likeIdea={likeIdea}/>}/>
          <Route path="/idea/:id" element={<IdeaDetails ideas={ideas} user={user} likeIdea={likeIdea} setIdeas={setIdeas}/>}/>
          <Route path="/submit" element={<SubmitIdea addIdea={addIdea}/>}/>
          <Route path="/leaderboard" element={<Leaderboard user={user}/>}/>
          <Route path="/rewards" element={<Rewards user={user}/>}/>
          <Route path="/profile" element={<Profile user={user} setUser={setUser} ideas={ideas}/>}/>
          <Route path="/settings" element={<Settings user={user} setUser={setUser}/>}/>
          <Route path="*" element={<Dashboard ideas={ideas} user={user} likeIdea={likeIdea}/>}/>
        </Routes>
      </main>
    </div>
  );
}

function Sidebar({ user, onLogout }) {
  const links = [
    ["/", "Dashboard", LayoutDashboard],
    ["/discover", "Explore Ideas", Compass],
    ["/ideas", "My Ideas", Lightbulb],
    ["/leaderboard", "Leaderboard", Trophy],
    ["/rewards", "Rewards", Medal],
    ["/profile", "Profile", UserRound]
  ];

  return (
    <aside className="sidebar">
      <Link to="/" className="brand">
        <span className="brand-mark"><Lightbulb size={21}/></span>
        <span>IDEA<span>HUB</span></span>
      </Link>

      <div className="side-section-label">WORKSPACE</div>

      <nav className="side-nav">
        {links.map(([to, label, Icon]) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) => isActive ? "side-link active" : "side-link"}
          >
            <Icon size={18}/><span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="side-card">
        <div className="side-card-icon"><Sparkles size={17}/></div>
        <strong>Give to Get</strong>
        <p>Contribute useful ideas to unlock deeper solutions.</p>
        <Link to="/submit" className="mini-button">Share an idea <ArrowRight size={14}/></Link>
      </div>

      <div className="sidebar-bottom">
        <NavLink to="/settings" className="side-link">
          <SettingsIcon size={18}/><span>Settings</span>
        </NavLink>

        <Link to="/profile" className="profile-mini">
          <Avatar text={user.avatar}/>
          <span><b>{user.name}</b><small>{user.points} contribution points</small></span>
          <ChevronDown size={15}/>
        </Link>

        <button
          type="button"
          className="auth-logout-btn"
          onClick={onLogout}
          style={{
            width: "100%",
            padding: "11px",
            marginTop: "12px",
            border: "1px solid #e8e3f1",
            borderRadius: "10px",
            background: "#fff",
            color: "#7457cc",
            cursor: "pointer",
            fontWeight: 700
          }}
        >
          Log out
        </button>
      </div>
    </aside>
  );
}

function Topbar({ user, notifications, clearNotifications, onLogout }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="topbar">
      <div className="mobile-brand"><Lightbulb size={18}/> IDEAHUB</div>

      <div className="top-search">
        <Search size={17}/>
        <input
          placeholder="Search ideas, people, categories..."
          onKeyDown={e => {
            if (e.key === "Enter") {
              window.location.href = `/discover?search=${encodeURIComponent(e.target.value)}`;
            }
          }}
        />
        <kbd>⌘ K</kbd>
      </div>

      <div className="top-actions">
        <Link className="new-idea-btn" to="/submit"><Plus size={17}/> New Idea</Link>

        <button className="icon-btn" onClick={() => setOpen(!open)} aria-label="Notifications">
          <Bell size={18}/>
          {notifications > 0 && <span className="notification-dot">{notifications}</span>}
        </button>

        <Link to="/profile" className="top-avatar"><Avatar text={user.avatar}/></Link>

        <button
          type="button"
          className="auth-logout-btn"
          onClick={onLogout}
          style={{
            padding: "9px 12px",
            border: "1px solid #e8e3f1",
            borderRadius: "10px",
            background: "#fff",
            color: "#7457cc",
            cursor: "pointer",
            fontWeight: 700
          }}
        >
          Logout
        </button>
      </div>

      {open && (
        <div className="notification-pop">
          <div className="pop-head">
            <b>Notifications</b>
            <button onClick={clearNotifications}>Mark read</button>
          </div>
          <p>🔥 Your idea received 12 new likes.</p>
          <p>🏆 You are 30 points away from Level 3.</p>
          <p>💡 A contributor commented on your idea.</p>
        </div>
      )}
    </header>
  );
}

function Avatar({ text, size = "normal" }) {
  return <span className={`avatar ${size}`}><span>{text}</span></span>;
}

function PageHead({ eyebrow, title, description, action }) {
  return (
    <div className="page-head">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, change, tone = "purple" }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${tone}`}><Icon size={20}/></div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small className={change?.startsWith("-") ? "negative" : ""}>{change}</small>
      </div>
    </div>
  );
}

function Dashboard({ ideas, user, likeIdea }) {
  const trending = ideas.slice(0, 3);

  return (
    <div className="content">
      <PageHead
        eyebrow="YOUR CREATIVE WORKSPACE"
        title={`Welcome back, ${user.name.split(" ")[0]} 👋`}
        description="Turn your ideas into impact, help others build, and grow your contributor reputation."
        action={<Link to="/submit" className="primary-btn"><Plus size={18}/> Share an Idea</Link>}
      />

      <section className="hero-banner">
        <div className="hero-copy">
          <span className="pill light">✨ GIVE-TO-GET COMMUNITY</span>
          <h2>Ideas become better<br/>when we build together.</h2>
          <p>Share useful ideas, earn contribution points and unlock deeper solutions from the community.</p>
          <Link to="/submit" className="hero-button">Share your idea <ArrowRight size={16}/></Link>
        </div>
        <div className="hero-orbit">
          <div className="orbit orbit1"></div><div className="orbit orbit2"></div>
          <div className="hero-bulb"><Lightbulb size={54}/></div>
          <span className="float-chip chip1">💡 842 likes</span>
          <span className="float-chip chip2">🏆 +25 points</span>
          <span className="float-chip chip3">🚀 Build together</span>
        </div>
      </section>

      <div className="stats-grid">
        <StatCard icon={Lightbulb} label="Ideas shared" value={user.ideas} change="+2 this month" tone="purple"/>
        <StatCard icon={Heart} label="Community likes" value={user.likes} change="+18 this month" tone="coral"/>
        <StatCard icon={Zap} label="Contribution points" value={user.points} change="+45 this month" tone="gold"/>
        <StatCard icon={Unlock} label="Solutions unlocked" value={user.unlocked} change="Keep contributing" tone="mint"/>
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-head">
            <div><span className="eyebrow">COMMUNITY</span><h3>Trending ideas 🔥</h3></div>
            <Link to="/discover">View all <ArrowRight size={14}/></Link>
          </div>
          <div className="idea-list">
            {trending.map(i => <IdeaRow key={i.id} idea={i} likeIdea={likeIdea}/>)}
          </div>
        </section>

        <section className="panel contribution-panel">
          <div className="panel-head">
            <div><span className="eyebrow">YOUR PROGRESS</span><h3>Contributor level</h3></div>
            <Medal size={21}/>
          </div>
          <div className="level-ring"><div><strong>Lv {user.level}</strong><span>Contributor</span></div></div>
          <div className="progress-label"><span>{user.points} / 250 points</span><b>58%</b></div>
          <div className="progress"><span style={{ width: `${Math.min(100, user.points / 2.5)}%` }}></span></div>
          <p className="muted">Earn points by sharing useful ideas, improving ideas and helping the community.</p>
          <Link to="/rewards" className="outline-btn">See rewards <ArrowRight size={15}/></Link>
        </section>
      </div>

      <section className="panel">
        <div className="panel-head">
          <div><span className="eyebrow">DISCOVER</span><h3>Explore by category</h3></div>
          <Link to="/discover">All categories <ArrowRight size={14}/></Link>
        </div>
        <div className="category-grid">
          {[
            ["🤖", "AI & Automation", "128 ideas", "purple"],
            ["🧑‍💻", "Engineering", "94 ideas", "blue"],
            ["🎨", "UX & Design", "72 ideas", "coral"],
            ["🌱", "Environment", "61 ideas", "mint"],
            ["📚", "Education", "53 ideas", "gold"]
          ].map(([emoji, name, count, tone]) => (
            <Link to={`/discover?category=${name}`} className={`category-card ${tone}`} key={name}>
              <span>{emoji}</span><b>{name}</b><small>{count}</small><ArrowRight size={15}/>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function IdeaRow({ idea, likeIdea }) {
  return (
    <article className="idea-row">
      <div className={`idea-vote ${idea.color}`}><ArrowUp size={18}/><b>{idea.likes}</b></div>
      <div className="idea-row-main">
        <Link to={`/idea/${idea.id}`}><h4>{idea.title}</h4></Link>
        <p>{idea.description}</p>
        <div className="meta">
          <span className={`tag ${idea.color}`}>{idea.category}</span>
          <span>•</span><span>{idea.difficulty} effort</span>
          <span>•</span><span>{idea.status}</span>
        </div>
        <div className="author">
          <Avatar text={idea.avatar} size="small"/>
          <span>{idea.author}</span><span className="dot-sep">•</span>
          <span>{idea.comments} comments</span>
        </div>
      </div>
      <button className="like-small" onClick={() => likeIdea(idea.id)}><Heart size={15}/></button>
    </article>
  );
}

function Discover({ ideas, likeIdea }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All categories");
  const [sort, setSort] = useState("Top");

  const filtered = useMemo(() => {
    let list = ideas.filter(i =>
      (i.title + i.description + i.category + (i.tags || []).join(" "))
        .toLowerCase()
        .includes(query.toLowerCase())
    );

    if (category !== "All categories") {
      list = list.filter(i => i.category === category);
    }

    if (sort === "Top") {
      list = [...list].sort(
        (a, b) =>
          ((b.likes || 0) + (b.views || 0)) -
          ((a.likes || 0) + (a.views || 0))
      );
    }

    if (sort === "Newest") {
      list = [...list].sort(
        (a, b) =>
          new Date(b.createdAt || b.created_at || 0) -
          new Date(a.createdAt || a.created_at || 0)
      );
    }

    if (sort === "Most liked") {
      list = [...list].sort(
        (a, b) => (b.likes || 0) - (a.likes || 0)
      );
    }

    return list;
  }, [ideas, query, category, sort]);

  return (
    <div className="content">
      <PageHead
        eyebrow="IDEA COMMUNITY"
        title="Ideas worth building 💡"
        description="Discover ideas, vote for your favorites, and help turn good concepts into great projects."
        action={<Link to="/submit" className="primary-btn"><Plus size={18}/> Share an Idea</Link>}
      />

      <div className="feature-strip">
        <div>
          <span className="pill">🔥 TRENDING NOW</span>
          <h2>AI Meeting Notes Summaries</h2>
          <p>Save preparation time and keep decisions visible across teams.</p>
        </div>
        <div className="feature-stats"><b>842 <small>upvotes</small></b><b>43 <small>comments</small></b></div>
        <Link to="/idea/1" className="dark-btn">View idea <ArrowRight size={15}/></Link>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={17}/>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search ideas..."/>
        </div>
        <div className="select-wrap">
          <SlidersHorizontal size={16}/>
          <select value={category} onChange={e => setCategory(e.target.value)}>
            <option>All categories</option><option>Productivity</option><option>Culture</option>
            <option>UX</option><option>Process</option><option>Engineering</option>
          </select>
        </div>
        <div className="select-wrap">
          <select value={sort} onChange={e => setSort(e.target.value)}>
            <option>Top</option><option>Newest</option><option>Most liked</option>
          </select>
          <ChevronDown size={15}/>
        </div>
      </div>

      <div className="discover-layout">
        <div className="ideas-grid">
          {filtered.map(i => <IdeaCard key={i.id} idea={i} likeIdea={likeIdea}/>)}
        </div>
        <aside className="right-rail">
          <div className="panel compact">
            <div className="panel-head"><h3>Top contributors</h3><Link to="/leaderboard">View all</Link></div>
            {[
              ["JS", "Jamie Scott", "1,274"],
              ["AL", "Alicia Lee", "982"],
              ["DM", "Devon Martinez", "876"],
              ["SR", "Sarah Rodriguez", "765"],
              ["CP", "Chloe Patel", "642"]
            ].map((x, idx) => (
              <div className="rank-row" key={x[1]}>
                <b>{idx + 1}</b><Avatar text={x[0]} size="small"/>
                <span>{x[1]}</span><strong>{x[2]}</strong>
              </div>
            ))}
          </div>
          <div className="give-card">
            <Send size={34}/><h3>Every idea sparks something great.</h3>
            <p>Your voice helps the whole community build better.</p>
            <Link to="/submit" className="outline-btn">See my ideas</Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

function IdeaCard({ idea, likeIdea }) {
  return (
    <article className="idea-card">
      <div className={`vote-box ${idea.color}`}><ArrowUp size={16}/><b>{idea.likes}</b></div>
      <div className="idea-card-content">
        <div className="card-top">
          <span className={`tag ${idea.color}`}>{idea.category}</span>
          <span className="status"><span className="status-dot"></span>{idea.status}</span>
        </div>
        <Link to={`/idea/${idea.id}`}><h3>{idea.title}</h3></Link>
        <p>{idea.description}</p>
        <div className="tag-list">{idea.tags.map(t => <span key={t}>#{t}</span>)}</div>
        <div className="card-footer">
          <div className="author"><Avatar text={idea.avatar} size="small"/><span>{idea.author}</span></div>
          <div className="card-actions">
            <button onClick={() => likeIdea(idea.id)}><Heart size={15}/>{idea.likes}</button>
            <span><MessageCircle size={15}/>{idea.comments}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

function MyIdeas({ ideas, user, likeIdea }) {
  const mine = ideas.filter(i => i.author === user.name);

  return (
    <div className="content">
      <PageHead eyebrow="YOUR WORK" title="My ideas" description="Manage the ideas you've shared and track how the community responds." action={<Link to="/submit" className="primary-btn"><Plus size={18}/> New Idea</Link>}/>
      <div className="myidea-summary">
        <StatCard icon={Lightbulb} label="Total ideas" value={mine.length} change="Your contributions" tone="purple"/>
        <StatCard icon={Heart} label="Total likes" value={mine.reduce((s, i) => s + i.likes, 0)} change="Community response" tone="coral"/>
        <StatCard icon={Eye} label="Total views" value={mine.reduce((s, i) => s + i.views, 0)} change="Keep sharing" tone="blue"/>
      </div>
      <div className="panel">
        <div className="panel-head"><h3>Your contributions</h3><span className="muted">{mine.length} ideas</span></div>
        {mine.length ? mine.map(i => <IdeaRow key={i.id} idea={i} likeIdea={likeIdea}/>) : <EmptyState/>}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="empty">
      <Lightbulb size={38}/><h3>No ideas yet</h3>
      <p>Share your first idea and start earning contribution points.</p>
      <Link to="/submit" className="primary-btn">Share an idea</Link>
    </div>
  );
}

function IdeaDetails({ ideas, user, likeIdea, setIdeas }) {
  const { id } = useParams();
  const idea = ideas.find(i => String(i.id) === String(id));
  const [comment, setComment] = useState("");

  if (!idea) return <div className="content"><EmptyState/></div>;

  const locked = user.points < 100;

  return (
    <div className="content">
      <Link to="/discover" className="back-link">← Back to ideas</Link>
      <div className="details-layout">
        <article className="detail-main panel">
          <div className="detail-head">
            <span className={`tag ${idea.color}`}>{idea.category}</span>
            <span className="status">{idea.status}</span>
          </div>
          <h1>{idea.title}</h1>
          <p className="detail-description">{idea.description}</p>
          <div className="detail-author">
            <Avatar text={idea.avatar}/>
            <div><b>{idea.author}</b><span>Community contributor · {idea.points} points</span></div>
          </div>
          <div className="detail-stats">
            <button onClick={() => likeIdea(idea.id)}><Heart size={17}/> {idea.likes} likes</button>
            <span><MessageCircle size={17}/> {idea.comments} comments</span>
            <span><Eye size={17}/> {idea.views} views</span>
          </div>
          <hr/>
          <h2>What is the idea?</h2>
          <p>{idea.description} This concept is designed to be practical, collaborative and easy to evolve with community feedback.</p>
          <div className={`solution-box ${locked ? "locked" : ""}`}>
            <div className="solution-head">
              {locked ? <LockKeyhole size={20}/> : <Unlock size={20}/>}
              <div>
                <h3>{locked ? "Detailed solution locked" : "Detailed solution unlocked"}</h3>
                <p>{locked ? "Contribute useful ideas to unlock the deeper implementation." : "You have enough contribution points to view this solution."}</p>
              </div>
            </div>
            {locked ? (
              <div className="unlock-cta">
                <div className="blur-lines"><span></span><span></span><span></span></div>
                <Link to="/submit" className="primary-btn"><Lightbulb size={16}/> Contribute to unlock</Link>
                <small>You need 100 points. You currently have {user.points}.</small>
              </div>
            ) : (
              <div className="solution-content">
                <p>{idea.solution}</p>
                <div className="code-chip">React + Spring Boot + MySQL + REST API</div>
              </div>
            )}
          </div>
          <div className="comments">
            <h2>Community discussion</h2>
            <div className="comment-input">
              <Avatar text={user.avatar}/>
              <input value={comment} onChange={e => setComment(e.target.value)} placeholder="Add a useful comment..."/>
              <button onClick={() => {
                if (comment.trim()) {
                  setIdeas(prev => prev.map(x => x.id === idea.id ? { ...x, comments: x.comments + 1 } : x));
                  setComment("");
                }
              }}><Send size={16}/></button>
            </div>
            <div className="comment">
              <Avatar text="AL" size="small"/>
              <div><b>Alicia Lee</b><p>Interesting direction. This could work well with a simple dashboard and clear onboarding.</p></div>
            </div>
          </div>
        </article>

        <aside className="details-side">
          <div className="panel">
            <h3>Idea activity</h3>
            <div className="activity-stat"><span>❤️ Likes</span><b>{idea.likes}</b></div>
            <div className="activity-stat"><span>💬 Comments</span><b>{idea.comments}</b></div>
            <div className="activity-stat"><span>👁 Views</span><b>{idea.views}</b></div>
          </div>
          <div className="panel">
            <h3>Tags</h3>
            <div className="tag-list large">{idea.tags.map(t => <span key={t}>#{t}</span>)}</div>
          </div>
          <div className="give-card">
            <Sparkles size={25}/><h3>Give to Get</h3>
            <p>Share your own idea to grow your contribution score and unlock deeper solutions.</p>
            <Link to="/submit" className="outline-btn">Contribute</Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

function SubmitIdea({ addIdea }) {
  const nav = useNavigate();
  const [form, setForm] = useState({
    title: "", category: "Productivity", description: "",
    solution: "", difficulty: "Medium", tags: ""
  });
  const [publishing, setPublishing] = useState(false);

  const update = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    if (!form.title || !form.description || !form.solution) return;

    setPublishing(true);
    const success = await addIdea({
      ...form,
      tags: form.tags.split(",").map(x => x.trim()).filter(Boolean)
    });
    setPublishing(false);

    if (success) nav("/ideas");
  };

  return (
    <div className="content narrow">
      <PageHead eyebrow="CONTRIBUTE" title="Share your idea 💡" description="A useful idea can inspire a whole project. Give the community enough context to build on it."/>
      <form className="form-card panel" onSubmit={submit}>
        <div className="form-banner">
          <Sparkles size={22}/>
          <div><b>+25 contribution points</b><span>You'll earn points when you publish a useful idea.</span></div>
        </div>
        <div className="form-grid">
          <label>Idea title<input name="title" value={form.title} onChange={update} placeholder="e.g. Smart College Lost & Found" required/></label>
          <label>Category<select name="category" value={form.category} onChange={update}><option>Productivity</option><option>AI</option><option>Education</option><option>Engineering</option><option>UX</option><option>Environment</option><option>Community</option></select></label>
          <label>Difficulty<select name="difficulty" value={form.difficulty} onChange={update}><option>Low</option><option>Medium</option><option>High</option></select></label>
          <label>Tags<input name="tags" value={form.tags} onChange={update} placeholder="AI, College, React"/></label>
        </div>
        <label>Short description<textarea name="description" value={form.description} onChange={update} placeholder="What problem does your idea solve?" required/></label>
        <label>Detailed solution<textarea className="solution-textarea" name="solution" value={form.solution} onChange={update} placeholder="Explain the approach, features, technology or implementation..." required/></label>
        <div className="give-note"><LockKeyhole size={17}/><span>Your detailed solution may be protected by IDEAHUB's Give-to-Get system. Users earn access by contributing.</span></div>
        <div className="form-actions">
          <Link to="/ideas" className="outline-btn">Cancel</Link>
          <button className="primary-btn" type="submit" disabled={publishing}>{publishing ? "Publishing..." : <><Send size={17}/> Publish Idea</>}</button>
        </div>
      </form>
    </div>
  );
}

function Leaderboard({ user }) {
  const rows = [
    ["JS", "Jamie Scott", "1,274", "Idea Master"],
    ["AL", "Alicia Lee", "982", "Top Contributor"],
    ["DM", "Devon Martinez", "876", "Innovator"],
    ["SR", "Sarah Rodriguez", "765", "Problem Solver"],
    ["CP", "Chloe Patel", "642", "Idea Starter"],
    [user.avatar, user.name, String(user.points), "You"]
  ];

  return (
    <div className="content">
      <PageHead eyebrow="COMMUNITY" title="Leaderboard 🏆" description="See the contributors whose ideas and helpful actions are creating the most value."/>
      <div className="podium">
        <div className="podium-card second"><span>🥈</span><Avatar text="AL"/><b>Alicia Lee</b><strong>982</strong><small>points</small></div>
        <div className="podium-card first"><span>👑</span><Avatar text="JS"/><b>Jamie Scott</b><strong>1,274</strong><small>points</small></div>
        <div className="podium-card third"><span>🥉</span><Avatar text="DM"/><b>Devon Martinez</b><strong>876</strong><small>points</small></div>
      </div>
      <div className="panel leaderboard-table">
        {rows.map((r, i) => (
          <div className={`leader-row ${r[1] === user.name ? "you" : ""}`} key={r[1]}>
            <b>{i + 1}</b><Avatar text={r[0]}/>
            <span><strong>{r[1]}</strong><small>{r[3]}</small></span>
            <div className="leader-bar"><i style={{ width: `${Math.min(100, parseInt(r[2].replace(",", "")) / 12.74)}%` }}></i></div>
            <strong>{r[2]}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function Rewards({ user }) {
  const rewards = [
    ["💡", "Idea Starter", "Share your first useful idea", 25],
    ["🔥", "Rising Contributor", "Reach 100 points", 100],
    ["🚀", "Innovation Master", "Reach 250 points", 250],
    ["🤝", "Community Builder", "Help improve 10 ideas", 350],
    ["👑", "Idea Legend", "Reach 750 points", 750]
  ];

  // Find the next badge to unlock
  const nextReward = rewards.find(
    ([emoji, name, desc, needed]) => user.points < needed
  );

  const progress = nextReward
    ? Math.min(100, (user.points / nextReward[3]) * 100)
    : 100;

  return (
    <div className="content">
      <PageHead
        eyebrow="RECOGNITION"
        title="Rewards & badges 🎖️"
        description="Your contribution is more than a number. Collect badges as you make the community better."
      />

      <div className="reward-hero">
        <div>
          <span className="pill light">YOUR CONTRIBUTION</span>
          <h2>{user.points} points</h2>

          {nextReward ? (
            <p>
              {nextReward[3] - user.points} points until {nextReward[1]}.
            </p>
          ) : (
            <p>Congratulations! You have unlocked all badges.</p>
          )}

          <div style={{
            width: "280px",
            maxWidth: "100%",
            height: "9px",
            background: "rgba(255,255,255,0.3)",
            borderRadius: "20px",
            marginTop: "14px",
            overflow: "hidden"
          }}>
            <div style={{
              width: `${progress}%`,
              height: "100%",
              background: "#ffffff",
              borderRadius: "20px",
              transition: "width 0.4s ease"
            }} />
          </div>

          {nextReward && (
            <small style={{ color: "white" }}>
              {user.points} / {nextReward[3]} points ({Math.round(progress)}%)
            </small>
          )}
        </div>

        <div className="big-medal">🏆</div>
      </div>

      <div className="reward-grid">
        {rewards.map(([emoji, name, desc, needed]) => {
          const earned = user.points >= needed;

          return (
            <div
              className={`reward-card ${earned ? "earned" : ""}`}
              key={name}
            >
              <div className="reward-icon">{emoji}</div>

              <div>
                <h3>{name}</h3>
                <p>{desc}</p>
              </div>

              {earned ? (
                <CheckCircle2 className="earned-icon" size={20} />
              ) : (
                <span className="needed">{needed} pts</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Profile({ user, setUser, ideas }) {
  const mine = ideas.filter(i => i.author === user.name);

  return (
    <div className="content">
      <PageHead eyebrow="YOUR IDENTITY" title="My profile" description="Your public contributor profile and community reputation." action={<Link to="/settings" className="outline-btn"><SettingsIcon size={16}/> Edit profile</Link>}/>
      <div className="profile-layout">
        <div className="profile-card panel">
          <div className="profile-cover"></div>
          <div className="profile-body">
            <Avatar text={user.avatar} size="xl"/>
            <h2>{user.name}</h2>
            <span className="role-pill">⭐ {user.role}</span>
            <p>{user.bio || "Building useful ideas, learning with the community and sharing what works."}</p>
            <div className="profile-stats">
              <b>{user.ideas}<small>Ideas</small></b>
              <b>{user.points}<small>Points</small></b>
              <b>{user.likes}<small>Likes</small></b>
              <b>{user.unlocked}<small>Unlocked</small></b>
            </div>
          </div>
        </div>

        <div className="profile-side">
          <div className="panel">
            <h3>Contribution progress</h3>
            <div className="level-line"><span>Level {user.level}</span><b>{user.points}/250</b></div>
            <div className="progress"><span style={{ width: `${Math.min(100, user.points / 2.5)}%` }}></span></div>
            <p className="muted">Keep sharing useful ideas to unlock deeper solutions.</p>
          </div>
          <div className="panel">
            <h3>Recent ideas</h3>
            {mine.slice(0, 3).map(i => (
              <Link className="recent-link" to={`/idea/${i.id}`} key={i.id}>
                <Lightbulb size={16}/><span>{i.title}<small>{i.likes} likes</small></span><ArrowRight size={15}/>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Settings({ user, setUser }) {
  const [name, setName] = useState(user.name);
  const [role, setRole] = useState(user.role);
  const [saved, setSaved] = useState(false);

  const save = () => {
    setUser({
      ...user,
      name,
      role,
      avatar: name.split(" ").map(x => x[0]).join("").slice(0, 2).toUpperCase()
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div className="content narrow">
      <PageHead eyebrow="ACCOUNT" title="Settings" description="Update your IDEAHUB profile details."/>
      <div className="panel settings-card">
        <div className="settings-avatar">
          <Avatar text={user.avatar} size="xl"/>
          <div><h3>Profile information</h3><p className="muted">This information appears beside your ideas.</p></div>
        </div>
        <label>Display name<input value={name} onChange={e => setName(e.target.value)}/></label>
        <label>Role<select value={role} onChange={e => setRole(e.target.value)}><option>Contributor</option><option>Student</option><option>Creator</option><option>Mentor</option></select></label>
        <div className="form-actions">
          <button className="primary-btn" onClick={save}>
            {saved ? <><CheckCircle2 size={17}/> Saved</> : <>Save changes</>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
