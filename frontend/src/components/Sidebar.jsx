
import { NavLink, useLocation } from "react-router-dom";

import {
  Activity,
  CheckSquare,
  FileText,
  Folder,
  MessageSquare,
  Moon,
  Plus,
  Settings,
  Sun,
  Sparkles,
  X
} from "lucide-react";

import { useTheme } from "../context/ThemeContext";

const links = [
  ["/", "Assistant", MessageSquare, true],
  ["/tasks", "Tasks", CheckSquare],
  ["/notes", "Notes", FileText],
  ["/files", "Files", Folder],
  ["/activity", "Activity", Activity]
];

export default function Sidebar({ open, close }) {
  const { theme, toggleTheme } = useTheme();
  const loc = useLocation();

  return (
    <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
      <div className="brand">
        <div className="brand-icon">
          <Sparkles />
        </div>

        <div>
          <b>CYGNUS</b>
          <small>Your personal AI</small>
        </div>

        <button className="mobile-close" onClick={close}>
          <X />
        </button>
      </div>

      <NavLink
        to="/"
        onClick={close}
        className="new-chat"
      >
        <Plus size={18} />
        New Chat
      </NavLink>

      <div className="nav-label">WORKSPACE</div>

      <nav>
        {links.map(([to, label, Icon, end]) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={close}
            className={({ isActive }) =>
              `nav-link ${isActive ? "active" : ""}`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <button
          className="bottom-link"
          onClick={toggleTheme}
        >
          {theme === "dark" ? <Sun /> : <Moon />}
          Switch to {theme === "dark" ? "Light" : "Dark"} Mode
        </button>

        <NavLink
          to="/settings"
          onClick={close}
          className={`bottom-link ${
            loc.pathname === "/settings" ? "active" : ""
          }`}
        >
          <Settings />
          Settings
        </NavLink>

        <div className="profile">
          <span>U</span>
          <div>
            <b>My Workspace</b>
            <small>Personal account</small>
          </div>
        </div>
      </div>
    </aside>
  );
}
