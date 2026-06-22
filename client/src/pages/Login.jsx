import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login, clearError } from "../features/auth/authSlice";
import { selectAuthLoading, selectIsAuthenticated, selectAuthError } from "../features/auth/authSelectors";
import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { motion } from "framer-motion";
import Loader from "../components/common/Loader";
import AlgoVerseLogo from "../components/common/AlgoVerseLogo";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const loading = useSelector(selectAuthLoading);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const error = useSelector(selectAuthError);

  const from = location.state?.from?.pathname || "/";

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
    return () => { dispatch(clearError()); };
  }, [isAuthenticated, navigate, from, dispatch]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login(formData));
  };

  return (
    <div className="flex-1 flex min-h-[90vh] bg-[#0a0c10] relative overflow-hidden">
      {/* Left side: Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 py-12 lg:px-16 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="mb-10 text-center lg:text-left">
            <Link to="/" className="inline-flex items-center gap-2 mb-8 group hover:opacity-90 transition-opacity">
              <AlgoVerseLogo size={26} icon="terminal-rounded" showBadge={false} />
            </Link>
            <h2 className="text-3xl font-display font-bold text-white mb-2 tracking-tight">Welcome back</h2>
            <p className="text-white/50 text-sm">Please enter your details to sign in.</p>
          </div>

          {/* Error Banner */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0, x: 0 }}
              animate={{ opacity: 1, height: "auto", x: [-10, 10, -10, 10, 0] }}
              transition={{ x: { duration: 0.4 }, opacity: { duration: 0.2 } }}
              className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.1)]"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
              {error}
            </motion.div>
          )}

          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2" htmlFor="email">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/30 group-focus-within:text-primary-400 transition-colors">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full bg-white/[0.03] border border-white/10 text-white rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-primary-500/50 focus:bg-white/[0.05] transition-all placeholder:text-white/20"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-white/80" htmlFor="password">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs font-medium text-primary-400 hover:text-primary-300 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/30 group-focus-within:text-primary-400 transition-colors">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full bg-white/[0.03] border border-white/10 text-white rounded-xl pl-11 pr-11 py-3.5 focus:outline-none focus:border-primary-500/50 focus:bg-white/[0.05] transition-all placeholder:text-white/20"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors focus:outline-none"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="relative w-full py-4 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] flex justify-center items-center gap-2 mt-4 overflow-hidden group"
            >
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shimmer"></div>
              {loading ? <Loader /> : <><ArrowRight className="w-5 h-5 relative z-10" /> <span className="relative z-10">Sign In</span></>}
            </button>
          </form>

          <p className="text-sm text-center text-white/50 mt-8">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary-400 hover:text-primary-300 transition-colors font-medium">
              Create an account
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right side: Illustration/Graphic */}
      <div className="hidden lg:flex lg:w-1/2 border-l border-white/5 relative overflow-hidden items-center justify-center bg-black/20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-[100px] animate-float" style={{ animationDelay: '0s' }}></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] animate-float" style={{ animationDelay: '4s' }}></div>
        
        {/* Glassmorphism Card */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-10 bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-lg shadow-2xl"
        >
          <div className="flex gap-2.5 mb-6">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
          </div>
          <pre className="text-sm font-mono text-primary-300 leading-relaxed overflow-x-auto">
            <code>
{`function getHired() {
  const skills = learnAlgorithms();
  const practice = solveProblems();
  
  if (skills && practice) {
    return "Dream Job Secured!";
  }
  
  return keepTrying();
}`}
            </code>
          </pre>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
