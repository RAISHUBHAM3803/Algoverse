import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { register, clearError } from "../features/auth/authSlice";
import { selectAuthLoading, selectIsAuthenticated, selectAuthError } from "../features/auth/authSelectors";
import { ArrowRight, Eye, EyeOff, User, Mail, Lock, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import Loader from "../components/common/Loader";
import AlgoVerseLogo from "../components/common/AlgoVerseLogo";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loading = useSelector(selectAuthLoading);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const error = useSelector(selectAuthError);

  // Calculate password strength
  const calculateStrength = (pass) => {
    let score = 0;
    if (!pass) return 0;
    if (pass.length >= 8) score += 1;
    if (pass.match(/[A-Z]/)) score += 1;
    if (pass.match(/[0-9]/)) score += 1;
    if (pass.match(/[^A-Za-z0-9]/)) score += 1;
    return score;
  };

  const strength = calculateStrength(formData.password);
  const strengthLabels = ["Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["bg-red-500", "bg-amber-500", "bg-primary-500", "bg-success"];

  useEffect(() => {
    if (isAuthenticated) navigate("/", { replace: true });
    return () => { dispatch(clearError()); };
  }, [isAuthenticated, navigate, dispatch]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    dispatch(register({ 
      name: formData.name, 
      email: formData.email, 
      password: formData.password,
      confirmPassword: formData.confirmPassword
    }));
  };

  return (
    <div className="flex-1 flex min-h-[90vh] bg-[#0a0c10] relative overflow-hidden">
      
      {/* Left side: Graphic/Illustration */}
      <div className="hidden lg:flex lg:w-1/2 border-r border-white/5 relative overflow-hidden items-center justify-center bg-black/20">
        {/* Abstract Background Gradients */}
        <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-primary-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px]"></div>
        
        {/* Glassmorphism Feature Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-10 max-w-lg shadow-2xl mx-10"
        >
          <div className="mb-10">
            <div className="w-16 h-16 bg-primary-500/10 rounded-2xl flex items-center justify-center mb-6 border border-primary-500/20">
              <AlgoVerseLogo size={32} icon="terminal-rounded" variant="icon" />
            </div>
            <h3 className="text-3xl font-display font-black text-white mb-4 tracking-tight">Join the Elite</h3>
            <p className="text-white/50 leading-relaxed text-sm">
              Create an account to access our curated library of algorithmic challenges, execute code in secure sandboxes, and build your daily streaks.
            </p>
          </div>
          
          <div className="space-y-5">
            {[
              "200+ Curated Problems",
              "Execution in 4 Languages",
              "Detailed Activity Heatmap"
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-success/10 border border-success/20 flex items-center justify-center text-success shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span className="text-white/80 font-medium text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right side: Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 py-12 lg:px-16 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="mb-10 text-center lg:text-left">
            <div className="lg:hidden flex justify-center mb-8">
              <Link to="/" className="inline-flex items-center gap-2 group hover:opacity-90 transition-opacity">
                <AlgoVerseLogo size={26} icon="terminal-rounded" showBadge={false} />
              </Link>
            </div>
            <h2 className="text-3xl font-display font-bold text-white mb-2 tracking-tight">Create an account</h2>
            <p className="text-white/50 text-sm">Start your journey to algorithmic mastery.</p>
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
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2" htmlFor="name">
                Full Name
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/30 group-focus-within:text-primary-400 transition-colors">
                  <User className="h-5 w-5" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="w-full bg-white/[0.03] border border-white/10 text-white rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-primary-500/50 focus:bg-white/[0.05] transition-all placeholder:text-white/20"
                  placeholder="Alan Turing"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            </div>

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
              <label className="block text-sm font-medium text-white/80 mb-2" htmlFor="password">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/30 group-focus-within:text-primary-400 transition-colors">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  className="w-full bg-white/[0.03] border border-white/10 text-white rounded-xl pl-11 pr-11 py-3.5 focus:outline-none focus:border-primary-500/50 focus:bg-white/[0.05] transition-all placeholder:text-white/20"
                  placeholder="Minimum 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Meter */}
              {formData.password && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-white/50">Password Strength</span>
                    <span className={`text-[10px] uppercase font-bold tracking-wider ${strengthColors[strength - 1]?.replace('bg-', 'text-') || 'text-red-500'}`}>
                      {strengthLabels[strength - 1] || "Very Weak"}
                    </span>
                  </div>
                  <div className="flex gap-1.5 h-1.5 w-full">
                    {[1, 2, 3, 4].map((level) => (
                      <div 
                        key={level} 
                        className={`flex-1 rounded-full transition-all duration-300 ${
                          strength >= level ? (strengthColors[strength - 1] || "bg-red-500") : "bg-white/10"
                        }`}
                      ></div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/30 group-focus-within:text-primary-400 transition-colors">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  required
                  className="w-full bg-white/[0.03] border border-white/10 text-white rounded-xl pl-11 pr-11 py-3.5 focus:outline-none focus:border-primary-500/50 focus:bg-white/[0.05] transition-all placeholder:text-white/20"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors focus:outline-none"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {/* Real-time Match Indicator */}
              {formData.confirmPassword && (
                <motion.p 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className={`text-[11px] mt-2 font-bold uppercase tracking-wide flex items-center gap-1.5 ${
                    formData.password === formData.confirmPassword ? "text-success" : "text-red-400"
                  }`}
                >
                  {formData.password === formData.confirmPassword ? (
                    <>✓ Passwords match</>
                  ) : (
                    <>✗ Passwords do not match</>
                  )}
                </motion.p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="relative w-full py-4 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] flex justify-center items-center gap-2 mt-6 overflow-hidden group"
            >
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shimmer"></div>
              {loading ? <Loader /> : <><ArrowRight className="w-5 h-5 relative z-10" /> <span className="relative z-10">Create Account</span></>}
            </button>
          </form>

          <p className="text-sm text-center text-white/50 mt-8">
            Already have an account?{" "}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 transition-colors font-medium">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
