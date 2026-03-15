import { BrowserRouter, Route, Routes } from "react-router-dom";
import { LandingPage, NotFound } from "./pages/index.js";

export const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);
