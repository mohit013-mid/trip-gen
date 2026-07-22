import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, AlertTriangle, Loader2 } from "lucide-react";
import api from "../services/api";

/**
 * Props:
 *  - onBack()        -> go back to landing page
 *  - onSwitchToSignup() -> navigate to the signup screen
 *  - onLoginSuccess(user) -> called with the response data on success
 */
export default function LoginPage({ onBack = () => {}, onSwitchToSignup = () => {}, onLoginSuccess = () => {} }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setLoading(true);
    setError(null);
    try {
      // Adjust to your actual auth endpoint
      const res = await api.post("/auth/login", { email, password });
      onLoginSuccess(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Couldn't log you in. Check your details and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center px-6" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');`}</style>

      <div className="absolute inset-0 -z-10 bg-white">
        <div className="absolute -bottom-32 -left-32 w-[520px] h-[520px] rounded-full bg-blue-300/40 blur-[110px]" />
        <div className="absolute -top-24 -right-16 w-[480px] h-[480px] rounded-full bg-emerald-200/50 blur-[110px]" />
      </div>

      <button
        onClick={onBack}
        className="absolute top-6 left-6 flex items-center gap-1.5 text-[13px] font-medium text-gray-500 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft size={15} /> Back
      </button>

      <div className="w-full max-w-[400px]">
        <div className="text-center mb-8">
          <span className="text-[19px] font-bold tracking-tight text-gray-900">TripGen<span className="font-normal">AI</span></span>
        </div>

        <div className="bg-white rounded-2xl shadow-[0_4px_28px_rgba(0,0,0,0.07)] border border-gray-100 p-7">
          <h1 className="text-[20px] font-semibold text-gray-900 mb-1">Welcome back</h1>
          <p className="text-[13.5px] text-gray-500 mb-6">Log in to pick up your trip planning where you left off.</p>

          {error && (
            <div className="flex items-center gap-2 mb-5 px-3.5 py-2.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[12.5px]">
              <AlertTriangle size={14} className="shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-[12.5px] font-medium text-gray-700 block mb-1.5">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-200 text-[14px] text-gray-800 placeholder:text-gray-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[12.5px] font-medium text-gray-700">Password</label>
                <button type="button" className="text-[12px] text-blue-600 hover:text-blue-700">Forgot?</button>
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 text-[14px] text-gray-800 placeholder:text-gray-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim() || !password}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-[14px] font-medium py-2.5 rounded-xl transition-colors mt-1"
            >
              {loading && <Loader2 size={15} className="animate-spin" />}
              {loading ? "Logging in…" : "Log In"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-[11.5px] text-gray-400">OR</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <button className="w-full flex items-center justify-center gap-2.5 border border-gray-200 hover:bg-gray-50 rounded-xl py-2.5 text-[13.5px] font-medium text-gray-700 transition-colors">
            <GoogleIcon /> Continue with Google
          </button>
        </div>

        <p className="text-center text-[13px] text-gray-500 mt-6">
          Don't have an account?{" "}
          <button onClick={onSwitchToSignup} className="text-blue-600 font-medium hover:text-blue-700">
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.9-2.26 5.36-4.78 7.01l7.73 6c4.51-4.18 7.09-10.36 7.09-17.48z" />
      <path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.02 24.02 0 0 0 0 21.56l7.98-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.9l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}