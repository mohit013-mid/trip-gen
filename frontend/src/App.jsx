import React from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LandingPage from "./components/LandingPage";
import LoginPage from "./components/LoginPage";
import SignupPage from "./components/SignupPage";
import TripPlanner from "./components/tripplanner";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingRoute />} />
        <Route path="/login" element={<LoginRoute />} />
        <Route path="/signup" element={<SignupRoute />} />
        {/* Chat stays open to guests, matching the reference site — only
            image-upload functionality is gated behind login there. If you
            want to require login to chat at all, wrap this in
            <ProtectedRoute> instead. */}
        <Route path="/chat/new" element={<ChatRoute />} />
      </Routes>
    </AuthProvider>
  );
}

function LandingRoute() {
  const navigate = useNavigate();
  return (
    <LandingPage
      onLogin={() => navigate("/login")}
      onGetStarted={(prompt) => navigate("/chat/new", { state: { prompt } })}
    />
  );
}

function LoginRoute() {
  const navigate = useNavigate();
  const { login } = useAuth();
  return (
    <LoginPage
      onBack={() => navigate("/")}
      onSwitchToSignup={() => navigate("/signup")}
      onLoginSuccess={(data) => {
        login(data); // saves token + user to localStorage and context
        navigate("/chat/new");
      }}
    />
  );
}

function SignupRoute() {
  const navigate = useNavigate();
  const { login } = useAuth();
  return (
    <SignupPage
      onBack={() => navigate("/")}
      onSwitchToLogin={() => navigate("/login")}
      onSignupSuccess={(data) => {
        login(data); // signup returns the same {access_token, user} shape
        navigate("/chat/new");
      }}
    />
  );
}

function ChatRoute() {
  const location = useLocation();
  return <TripPlanner initialPrompt={location.state?.prompt || ""} />;
}