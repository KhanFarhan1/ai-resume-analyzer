import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// import "./index.css";
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import Footer from "./features/common/Footer";
import Navbar from "./features/common/Navbar";
import { AuthProvider } from "./features/auth/auth.context";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Navbar></Navbar>
        <Routes>
          <Route path="/login" element={<Login></Login>} />
          <Route path="/register" element={<Register></Register>} />
        </Routes>
        <Footer></Footer>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
);
