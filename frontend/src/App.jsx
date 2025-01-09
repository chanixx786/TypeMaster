import React from "react";

import { createBrowserRouter, createRoutesFromElements, RouterProvider, Route } from "react-router-dom";

// Pages
import TypingGame from "./pages/TypingGame";
import TypingTest from "./pages/TypingTest";
import TypingTutor from "./pages/TypingTutor";
import TimeCategory from "./pages/TimeCategory";

// Layouts
import MainLayout from "./layout/MainLayout";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<MainLayout />}>
      <Route index element={<TypingTest />} /> {/* Default route */}
      <Route path="tutor" element={<TypingTutor />} />
      <Route path="game" element={<TypingGame />} />
      <Route path="TimeCategory/:minutes" element={<TimeCategory />} />
    </Route>
  )
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
