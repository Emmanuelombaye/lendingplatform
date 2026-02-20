// src/app/components/auth.tsx
import React, { useState } from "react";
import { LoginForm, RegisterForm } from "./AuthComponents";

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  const handleLogin = async (data: { email: string; password: string }) => {
    try {
      console.log("Login data:", data);
      // TODO: Call your backend login API here
      alert("Logged in successfully!");
    } catch (error) {
      console.error(error);
      alert("Login failed!");
    }
  };

  const handleRegister = async (data: { name: string; email: string; password: string }) => {
    try {
      console.log("Register data:", data);
      // TODO: Call your backend register API here
      alert("Registered successfully!");
    } catch (error) {
      console.error(error);
      alert("Registration failed!");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-toggle">
        <button
          className={isLogin ? "active" : ""}
          onClick={() => setIsLogin(true)}
        >
          Login
        </button>
        <button
          className={!isLogin ? "active" : ""}
          onClick={() => setIsLogin(false)}
        >
          Register
        </button>
      </div>

      <div className="auth-form-wrapper">
        {isLogin ? (
          <LoginForm onSubmit={handleLogin} />
        ) : (
          <RegisterForm onSubmit={handleRegister} />
        )}
      </div>
    </div>
  );
};

export default Auth;