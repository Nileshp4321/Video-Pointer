
import React, { useState } from "react";
import { AiOutlineUser, AiOutlineLock } from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      const { token, user, currentUser } = await response.json();
      const { _id } = user;
      console.log(_id);
      localStorage.setItem("userId", _id);
      localStorage.setItem("currentUser", currentUser);
      if (!token) {
        setErrorMessage("User not Exist");
        return;
      }
      console.log("user>>>>>>>>>>>>>>>>>", user);
      localStorage.setItem("userToken", token);
      console.log("login succes");
      navigate("/dashboard");
    } catch (error) {
      setErrorMessage("Invalid email or password");
      console.error("Login Error:", error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-96"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
        {errorMessage && (
          <p className="text-red-500 mb-4">{errorMessage}</p>
        )}{" "}
        {/* Error message display */}
        <div className="mb-4 relative">
          <AiOutlineUser className="absolute left-3 top-3 text-gray-400" />
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
            required
          />
        </div>
        <div className="mb-4 relative">
          <AiOutlineLock className="absolute left-3 top-3 text-gray-400" />
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200"
        >
          Login
        </button>
        <p className="mt-4 text-center text-gray-600">
          Don't have an account?{" "}
          <Link to="/signup" className="text-blue-600 hover:underline">
            Sign Up
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
