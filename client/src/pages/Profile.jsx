import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateProfile } from "../features/auth/authSlice";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  GitBranch,
  Link2,
  Globe,
  FileText,
  Shield,
  CheckCircle2,
  Target,
  BarChart2,
  Zap,
  Loader2,
  Lock,
  Save,
  Award,
} from "lucide-react";

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="flex flex-col items-center justify-center bg-white/[0.03] border border-white/10 rounded-2xl p-5 hover:bg-white/[0.06] transition-all duration-300 group">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color} bg-white/5`}>
      <Icon className="w-5 h-5" />
    </div>
    <span className="text-2xl font-display font-bold text-white">{value ?? 0}</span>
    <span className="text-xs text-white/40 font-medium mt-1 uppercase tracking-wider">{label}</span>
  </div>
);

const InputField = ({ label, icon: Icon, type = "text", name, value, onChange, placeholder, readOnly = false }) => (
  <div className="group">
    <label className="block text-xs font-bold uppercase tracking-widest text-white/40 mb-2">{label}</label>
    <div className="relative">
      <div className={`absolute left-4 top-1/2 -translate-y-1/2 ${readOnly ? "text-white/20" : "text-white/40 group-focus-within:text-primary-400"} transition-colors`}>
        <Icon className="w-4 h-4" />
      </div>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`w-full pl-11 pr-4 py-3.5 rounded-xl border text-sm font-medium transition-all duration-300 outline-none bg-white/[0.03] text-white placeholder-white/25 ${
          readOnly
            ? "border-white/5 text-white/30 cursor-not-allowed"
            : "border-white/10 focus:border-primary-500/50 focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)]"
        }`}
      />
      {readOnly && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <Lock className="w-3.5 h-3.5 text-white/20" />
        </div>
      )}
    </div>
  </div>
);

const Profile = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    name: "",
    "profile.bio": "",
    "profile.github": "",
    "profile.linkedin": "",
    "profile.website": "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        "profile.bio": user.profile?.bio || "",
        "profile.github": user.profile?.github || "",
        "profile.linkedin": user.profile?.linkedin || "",
        "profile.website": user.profile?.website || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(updateProfile(form));
  };

  const accuracy = user?.stats?.totalSubmissions
    ? Math.round((user.stats.acceptedSubmissions / user.stats.totalSubmissions) * 100)
    : 0;

  const avatarInitials = (user?.name || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    : "—";

  return (
    <div className="min-h-screen bg-[#0a0c10] relative overflow-hidden">
      {/* Background Glow Orbs */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-primary-600/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[400px] h-[400px] bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* ── Hero / Avatar Section ─────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-surface/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-8 relative overflow-hidden"
        >
          {/* Card inner glow */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-primary-500/5 blur-[60px] rounded-full pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-display font-black shadow-[0_0_40px_rgba(99,102,241,0.4)]">
                {avatarInitials}
              </div>
              <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-success rounded-full border-2 border-[#0a0c10] flex items-center justify-center shadow-[0_0_10px_rgba(34,197,94,0.5)]">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Identity */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                <h1 className="text-3xl font-display font-black text-white tracking-tight">
                  {user?.name || "Loading..."}
                </h1>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest bg-primary-500/10 text-primary-400 border border-primary-500/20">
                  <Shield className="w-3 h-3" />
                  {user?.role || "User"}
                </span>
              </div>
              <p className="text-white/50 text-sm flex items-center justify-center sm:justify-start gap-2 mb-1">
                <Mail className="w-3.5 h-3.5" />
                {user?.email}
              </p>
              <p className="text-white/30 text-xs mt-2">Member since {joinDate}</p>
              {user?.profile?.bio && (
                <p className="mt-3 text-white/60 text-sm leading-relaxed max-w-lg">
                  {user.profile.bio}
                </p>
              )}
            </div>

            {/* Social links (read) */}
            <div className="flex flex-row sm:flex-col gap-3">
              {user?.profile?.github && (
                <a href={user.profile.github} target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all duration-300">
                  <GitBranch className="w-4 h-4" />
                </a>
              )}
              {user?.profile?.linkedin && (
                <a href={user.profile.linkedin} target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all duration-300">
                  <Link2 className="w-4 h-4" />
                </a>
              )}
              {user?.profile?.website && (
                <a href={user.profile.website} target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all duration-300">
                  <Globe className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── Stats Row ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <StatCard icon={Target} label="Problems Solved" value={user?.stats?.solvedCount} color="text-primary-400" />
          <StatCard icon={Zap} label="Accepted" value={user?.stats?.acceptedSubmissions} color="text-success" />
          <StatCard icon={BarChart2} label="Total Submissions" value={user?.stats?.totalSubmissions} color="text-indigo-400" />
          <StatCard icon={Award} label="Accuracy" value={`${accuracy}%`} color="text-amber-400" />
        </motion.div>

        {/* ── Difficulty Breakdown ───────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="bg-surface/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8"
        >
          <h2 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-5">Difficulty Breakdown</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Easy", value: user?.stats?.easySolved || 0, color: "text-success", bar: "bg-success", glow: "shadow-[0_0_10px_rgba(34,197,94,0.4)]" },
              { label: "Medium", value: user?.stats?.mediumSolved || 0, color: "text-amber-400", bar: "bg-amber-400", glow: "shadow-[0_0_10px_rgba(251,191,36,0.4)]" },
              { label: "Hard", value: user?.stats?.hardSolved || 0, color: "text-danger", bar: "bg-danger", glow: "shadow-[0_0_10px_rgba(239,68,68,0.4)]" },
            ].map((d) => (
              <div key={d.label} className="text-center">
                <div className={`text-3xl font-display font-black ${d.color} mb-1`}>{d.value}</div>
                <div className={`h-1.5 w-12 mx-auto rounded-full ${d.bar} ${d.glow} mb-2`} />
                <div className="text-xs text-white/40 font-medium">{d.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Edit Profile Form ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-surface/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 relative overflow-hidden"
        >
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-500/5 blur-[80px] rounded-full pointer-events-none" />

          <div className="relative z-10">
            <h2 className="text-xl font-display font-bold text-white tracking-tight mb-1">Edit Profile</h2>
            <p className="text-white/40 text-sm mb-8">Update your personal information and social links.</p>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Full Name"
                icon={User}
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your display name"
              />
              <InputField
                label="Email Address"
                icon={Mail}
                name="email"
                value={user?.email || ""}
                placeholder="Email cannot be changed"
                readOnly
              />

              {/* Bio — full width */}
              <div className="md:col-span-2 group">
                <label className="block text-xs font-bold uppercase tracking-widest text-white/40 mb-2">Bio</label>
                <div className="relative">
                  <div className="absolute left-4 top-4 text-white/40 group-focus-within:text-primary-400 transition-colors">
                    <FileText className="w-4 h-4" />
                  </div>
                  <textarea
                    name="profile.bio"
                    value={form["profile.bio"]}
                    onChange={handleChange}
                    placeholder="Tell the community a little about yourself..."
                    rows={3}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-white/10 bg-white/[0.03] text-white text-sm font-medium placeholder-white/25 focus:border-primary-500/50 focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)] transition-all duration-300 outline-none resize-none"
                  />
                </div>
              </div>

              <InputField
                label="GitHub Profile"
                icon={GitBranch}
                name="profile.github"
                value={form["profile.github"]}
                onChange={handleChange}
                placeholder="https://github.com/yourusername"
              />
              <InputField
                label="LinkedIn Profile"
                icon={Link2}
                name="profile.linkedin"
                value={form["profile.linkedin"]}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/yourprofile"
              />
              <InputField
                label="Personal Website"
                icon={Globe}
                name="profile.website"
                value={form["profile.website"]}
                onChange={handleChange}
                placeholder="https://yourwebsite.com"
              />

              {/* Submit */}
              <div className="md:col-span-2 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2.5 px-8 py-3.5 bg-primary-600 hover:bg-primary-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] hover:scale-105 active:scale-95"
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                  ) : (
                    <><Save className="w-4 h-4" /> Save Changes</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default Profile;
