import { Outlet } from "react-router-dom";
import Navbar from "../components/navbar";

export default function UserLayout() {
    const items=[
        {id: 1, name: "Test", path: ""},
        {id: 2, name: "Tutor", path: "/tutor"},
        {id: 3, name: "Game", path: "/game"},
        {id: 4, name: "Leaderboard", path: "/leaderboard"}
      ];
      
    return (
        <div className="flex flex-col min-h-screen lg:mx-42 md:mx-32 sm:mx-16 xs:mx-8">
            <Navbar items={items} />
            <main className="container mx-auto py-8">
                <Outlet />
            </main>
        </div>
    )
}