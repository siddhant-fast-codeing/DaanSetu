import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import Ngolist from "./pages/Ngolist";
import Signin from "./pages/Signin";
import Signup from "./pages/Signup";
import Ngodata from "./pages/Ngodata";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import AuthGuard from "../AuthGuard";
import Requirements from "./components/Requirements";
import Admin from "./components/Admin";

function App() {
  const PrivateRoute = ({ children }) => {
    const user = JSON.parse(localStorage.getItem("user"));

    return user ? children : <Navigate to="/signin" replace />;
  };

  return (
    <>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Ngolist />} />
          <Route
            path="/signin"
            element={
              <AuthGuard>
                <Signin />
              </AuthGuard>
            }
          />
          <Route
            path="/signup"
            element={
              <AuthGuard>
                <Signup />
              </AuthGuard>
            }
          />
          <Route path="/about" element={<Ngodata />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route path="/asd" element={<Requirements />} />
          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <Admin />
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
