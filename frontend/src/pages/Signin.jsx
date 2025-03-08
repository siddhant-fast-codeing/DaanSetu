import React, { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { app } from "../db/firebase";

const SigninForm = () => {
  const auth = getAuth(app);
  const db = getFirestore(app);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();

        // Store user type & email in localStorage
        localStorage.setItem(
          "user",
          JSON.stringify({
            email: user.email,
            userType: userData.userType,
            uid: user.uid,
          })
        );

        // Redirect user based on their type
        if (userData.userType === "admin") {
          navigate("/admin");
        } else if (userData.userType === "ngo") {
          navigate("/dashboard");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (error) {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <div className="w-full max-w-lg p-8 bg-gray-900 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-center text-yellow-400">
          दान<span className="text-gray-400">$</span>ETU
        </h2>
        <p className="text-center text-gray-400">Sign In to your account</p>

        {error && <p className="text-red-500 text-center mt-2">{error}</p>}

        <form onSubmit={handleSignin} className="mt-6 space-y-4">
          <label>Email Address</label>
          <input
            type="email"
            name="email"
            required
            className="input-field"
            onChange={handleChange}
          />

          <label>Password</label>
          <input
            type="password"
            name="password"
            required
            className="input-field"
            onChange={handleChange}
          />

          <button
            type="submit"
            className="w-full mt-6 py-2 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-600 transition"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default SigninForm;
