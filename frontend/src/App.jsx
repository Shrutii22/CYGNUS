
import { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";

import Assistant from "./pages/Assistant";
import Tasks from "./pages/Tasks";
import Notes from "./pages/Notes";
import Files from "./pages/Files";
import Activity from "./pages/Activity";
import Settings from "./pages/Settings";

export default function App() {
  const [open, setOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar
        open={open}
        close={() => setOpen(false)}
      />

      {open && (
        <button
          className="scrim"
          onClick={() => setOpen(false)}
        />
      )}

      <main className="main">
        <Topbar menu={() => setOpen(true)} />

        <div className="page-scroll">
          <Routes>
            <Route path="/" element={<Assistant />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/files" element={<Files />} />
            <Route path="/activity" element={<Activity />} />
            <Route path="/settings" element={<Settings />} />

            <Route
              path="*"
              element={<Navigate to="/" replace />}
            />
          </Routes>
        </div>
      </main>
    </div>
  );
}
