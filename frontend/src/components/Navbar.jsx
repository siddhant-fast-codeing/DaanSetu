import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-row justify-between  bg-black text-white p-4">
      <nav className="navbar flex flex-row justify-start items-center">
        <img
          src={logo}
          alt="logo"
          className="h-14 m-4 cursor-pointer"
          onClick={() => navigate("/")}
        />

        <ul className="flex flex-row space-x-5 ml-10">
          <li
            onClick={() => navigate("/")}
            className="text-2xl hover:text-blue-300 hover:transform hover:cursor-pointer hover:-translate-y-1 transition-transform duration-300"
          >
            Home
          </li>
          <li
            onClick={() => navigate("/search")}
            className="text-2xl hover:text-blue-300 hover:transform hover:cursor-pointer hover:-translate-y-1 transition-transform duration-300"
          >
            NGO's
          </li>
          <li className="text-2xl hover:text-blue-300 hover:transform hover:cursor-pointer hover:-translate-y-1 transition-transform duration-300">
            Donation
          </li>
          <li className="text-2xl hover:text-blue-300 hover:transform hover:cursor-pointer hover:-translate-y-1 transition-transform duration-300">
            Profile
          </li>
        </ul>
      </nav>

      <div className="flex flex-row justify-evenly">
        {!localStorage.getItem("user") && (
          <div className="flex flex-row justify-evenly">
            <button
              onClick={() => navigate("/signin")}
              className="bg-transparent border-2 text-xl font-bold border-cyan-700 w-full text-cyan-700 m-1 px-4 rounded-xl hover:bg-cyan-100"
            >
              Sign In
            </button>

            <button
              onClick={() => navigate("/signup")}
              className="bg-transparent border-2 text-xl font-bold border-cyan-700 w-full text-cyan-700 m-1 px-4 rounded-xl hover:bg-cyan-100"
            >
              Sign Up
            </button>
          </div>
        )}
        {localStorage.getItem("user") &&
          JSON.parse(localStorage.getItem("user")).userType === "admin" && (
            <button
              onClick={() => {
                navigate("/admin");
              }}
              className="bg-transparent border-2 text-xl font-bold border-cyan-700 w-full text-cyan-700 m-1 px-4 rounded-xl hover:bg-cyan-100"
            >
              Admin Page
            </button>
          )}
        {localStorage.getItem("user") && (
          <button
            onClick={() => {
              localStorage.removeItem("user");
              navigate("/");
            }}
            className="bg-transparent border-2 text-xl font-bold border-cyan-700 w-full text-cyan-700 m-1 px-4 rounded-xl hover:bg-cyan-100"
          >
            Logout
          </button>
        )}
      </div>
    </div>
  );
}

export default Navbar;
