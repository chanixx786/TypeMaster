import { Outlet } from "react-router-dom";
import Navbar from "../components/navbar";

export default function UserLayout() {
  const items = [
    { id: 1, name: "Test", path: "" },
    { id: 2, name: "Tutor", path: "/tutor" },
    { id: 3, name: "Game", path: "/game" },
    { id: 4, name: "Leaderboard", path: "/leaderboard" },
  ];

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background font-mono text-foreground">

      {/* Navbar */}
      <div className="mx-auto w-full max-w-5xl px-3 sm:px-6">
        <Navbar items={items} />
      </div>

      {/* Page Content */}
      <main className="flex min-h-0 w-full flex-1 overflow-hidden">
        <div className="w-full overflow-y-auto">
          <div className="mx-auto w-full max-w-5xl px-3 py-6 sm:px-6 sm:py-8">
            <Outlet />
          </div>
        </div>
      </main>

    </div>
  );
}