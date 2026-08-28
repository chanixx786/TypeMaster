import React from "react";

import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
} from "react-router-dom";

// Pages
import TypingGame from "./pages/game";
import Test from "./pages/test";
import TypingTutor from "./pages/tutor";
// Layouts
import AdminLayout from "./layout/admin_layout";
import UserLayout from "./layout/user_layout";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* Admin */}
      <Route path="/admin" element={<AdminLayout />}>
      </Route>

      {/* User */}
      <Route path="/" element={<UserLayout />}>
        <Route index element={<Test />} /> 
        <Route path="/tutor" element={<TypingTutor />} />
        <Route path="/game" element={<TypingGame />} />
        <Route path="/leaderboard" element={<TypingTutor />} />
      </Route>
    </>,
  ),
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
