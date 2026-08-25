import React from "react";

import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
} from "react-router-dom";

// Pages
import TypingGame from "./pages/game";
import TypingTest from "./pages/TypingTest";
import TypingTutor from "./pages/tutor";
import TimeCategory from "./pages/TimeCategory";

// Layouts
import AdminLayout from "./layout/admin_layout";
import UserLayout from "./layout/user_layout";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<TypingTest />} /> {/* Default route */}
        <Route path="tutor" element={<TypingTutor />} />
        <Route path="game" element={<TypingGame />} />
        <Route path="TimeCategory/:minutes" element={<TimeCategory />} />
      </Route>

      <Route path="/" element={<UserLayout />}>
        <Route index element={<TypingTest />} /> {/* Default route for user layout */}
      </Route>
    </>,
  ),
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
