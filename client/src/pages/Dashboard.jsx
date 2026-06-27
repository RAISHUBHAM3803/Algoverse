import React, { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "../features/auth/authSelectors";
import { motion } from "framer-motion";
import { 
  Trophy, Flame, Target, Code2, 
  Activity, CheckCircle2, XCircle, Clock, Loader2, Server
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { ShimmerCard } from "../components/common/Shimmer";

// ─── Stat Card & Skeleton ──────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, colorClass, delay, loading }) => {
  if (loading) {
    return <ShimmerCard />;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.4, delay, type: "spring", stiffness: 300 }}
      className="bg-surface/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex items-center gap-5 relative overflow-hidden group shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all duration-300 z-10"
    >
      <div className={`absolute -right-6 -top-6 w-32 h-32 rounded-full blur-[40px] opacity-20 transition-opacity duration-500 group-hover:opacity-40 ${colorClass.replace('text-', 'bg-')} -z-10`}></div>
      <div className={`relative w-14 h-14 rounded-2xl flex items-center justify-center border border-white/10 bg-white/5 shadow-inner overflow-hidden`}>
        <div className={`absolute inset-0 opacity-20 ${colorClass.replace('text-', 'bg-')}`}></div>
        <Icon className={`w-7 h-7 ${colorClass} relative z-10`} />
      </div>
      <div>
        <p className="text-text-muted text-xs font-semibold uppercase tracking-wider mb-1">{label}</p>
        <h3 className="text-3xl font-display font-bold text-white drop-shadow-sm">{value}</h3>
      </div>
    </motion.div>
  );
};

// ─── Main Dashboard ─────────────────────────────────────────────────────────
const Dashboard = () => {
  const user = useSelector(selectUser);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    solved: 0,
    total: 0,
    streak: 0,
    rank: "Unranked",
    accuracy: 0
  });

  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [heatmapData, setHeatmapData] = useState({});
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [difficultyData, setDifficultyData] = useState({
    Easy: { solved: 0, total: 0 },
    Medium: { solved: 0, total: 0 },
    Hard: { solved: 0, total: 0 }
  });
  const [languageData, setLanguageData] = useState([]);

  const timeAgo = (dateStr) => {
    const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " mins ago";
    return "Just now";
  };

  const fetchStats = useCallback(async () => {
    let isMounted = true;
    try {
      // Use allSettled so a single failing endpoint doesn't wipe the whole dashboard
      const [summaryRes, submissionsRes, heatmapRes, difficultyRes, langRes] = await Promise.allSettled([
        api.get("/dashboard/summary"),
        api.get("/submissions/my?limit=5"),
        api.get("/dashboard/activity"),
        api.get("/dashboard/difficulty"),
        api.get("/dashboard/languages"),
        new Promise(resolve => setTimeout(resolve, 600)) // Show Shimmer
      ]);

      if (!isMounted) return;

      // Helper to safely extract data from settled promises
      const getValue = (result, fallback = null) =>
        result.status === "fulfilled" ? result.value.data : fallback;

      if (summaryRes.status === "rejected") {
        console.error("[Dashboard] summary API failed:", summaryRes.reason?.response?.data || summaryRes.reason?.message);
      }

      const summaryData  = getValue(summaryRes);
      const subsData     = getValue(submissionsRes)?.data || [];
      const activityData = getValue(heatmapRes)?.data    || [];
      const diffData     = getValue(difficultyRes)?.data || [];
      const langData     = getValue(langRes)?.data       || [];

      if (summaryData?.data) {
        const data = summaryData.data;
        let rank = "Bronze";
        if (data.totalSolved === 0) rank = "Unranked";
        else if (data.totalSolved >= 150) rank = "Platinum";
        else if (data.totalSolved >= 50)  rank = "Gold";
        else if (data.totalSolved >= 10)  rank = "Silver";

        setStats({
          solved:   data.totalSolved,
          total:    data.totalProblems || 0,
          streak:   data.currentStreak || 0,
          rank:     rank,
          accuracy: data.acceptanceRate || 0
        });
      }

      setRecentSubmissions(subsData);

      const activityMap = {};
      activityData.forEach(item => { activityMap[item.date] = item.count; });
      setHeatmapData(activityMap);

      const easyDiff   = diffData.find(d => d.difficulty === "Easy")   || { solved: 0, total: 1 };
      const mediumDiff = diffData.find(d => d.difficulty === "Medium") || { solved: 0, total: 1 };
      const hardDiff   = diffData.find(d => d.difficulty === "Hard")   || { solved: 0, total: 1 };

      setDifficultyData({
        Easy:   { solved: easyDiff.solved,   total: easyDiff.total },
        Medium: { solved: mediumDiff.solved, total: mediumDiff.total },
        Hard:   { solved: hardDiff.solved,   total: hardDiff.total }
      });

      setLanguageData(langData);
    } catch (error) {
      console.error("[Dashboard] Critical fetch error:", error);
    } finally {
      if (isMounted) setLoading(false);
    }
    return () => { isMounted = false; };
  }, []);

  // Initial load
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Live refresh — fires when SolveProblem gets an Accepted verdict
  useEffect(() => {
    const handler = () => fetchStats();
    window.addEventListener("submission:accepted", handler);
    return () => window.removeEventListener("submission:accepted", handler);
  }, [fetchStats]);

  const currentYear = new Date().getFullYear();
  const targetEndDate = selectedYear === currentYear 
    ? new Date() 
    : new Date(selectedYear, 11, 31);
    
  const dayOfWeek = targetEndDate.getDay(); 
  const weeksToShow = 26; 
  const startDay = new Date(targetEndDate);
  startDay.setDate(targetEndDate.getDate() - (weeksToShow * 7 + dayOfWeek));

  const heatmapDays = [];
  const daysDiff = Math.floor((targetEndDate - startDay) / (1000 * 60 * 60 * 24));
  for (let i = 0; i <= daysDiff; i++) {
    const d = new Date(startDay);
    d.setDate(startDay.getDate() + i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    heatmapDays.push({ date: dateStr, count: heatmapData[dateStr] || 0 });
  }

  const getHeatmapColor = (count) => {
    if (count === 0) return "bg-white/5 border-white/5";
    if (count < 3) return "bg-primary-500/40 border-primary-500/20";
    if (count < 6) return "bg-primary-500/70 border-primary-500/50 shadow-[0_0_8px_rgba(99,102,241,0.3)]";
    return "bg-primary-400 border-primary-300/80 shadow-[0_0_12px_rgba(99,102,241,0.6)]";
  };

  const StatusBadge = ({ status }) => {
    if (status === "Accepted") return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-success text-[10px] font-bold uppercase tracking-wider bg-success/10 border border-success/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]"><CheckCircle2 className="w-3.5 h-3.5"/> AC</span>;
    if (status === "Wrong Answer") return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-danger text-[10px] font-bold uppercase tracking-wider bg-danger/10 border border-danger/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]"><XCircle className="w-3.5 h-3.5"/> WA</span>;
    return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-warning text-[10px] font-bold uppercase tracking-wider bg-warning/10 border border-warning/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]"><Clock className="w-3.5 h-3.5"/> {status?.substring(0,3)?.toUpperCase() || "ERR"}</span>;
  };

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="w-full min-h-screen relative z-10 flex flex-col py-10 lg:py-16 bg-[#0a0c10] overflow-hidden">
      {/* Premium Background Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-600/20 blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none"></div>
      
      <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        
        {/* Welcome Section */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div>
            <h1 className="text-4xl lg:text-5xl font-display font-bold text-white tracking-tight mb-3 drop-shadow-sm">
              {getTimeOfDay()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-indigo-400">{user?.name?.split(' ')[0] || 'Developer'}</span>
            </h1>
            <p className="text-text-secondary text-base">Your algorithmic journey continues here.</p>
          </div>
          <Link to="/problems" className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_25px_rgba(255,255,255,0.1)] hover:scale-105">
            <Code2 className="w-5 h-5" /> Resume Practice
          </Link>
        </motion.div>

        {/* Top Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard loading={loading} delay={0.1} icon={Target} label="Problems Solved" value={`${stats.solved} / ${stats.total}`} colorClass="text-primary-400" />
          <StatCard loading={loading} delay={0.2} icon={Flame} label="Current Streak" value={`${stats.streak} Days`} colorClass="text-warning" />
          <StatCard loading={loading} delay={0.3} icon={Trophy} label="Developer Tier" value={stats.rank} colorClass="text-success" />
          <StatCard loading={loading} delay={0.4} icon={Activity} label="Accuracy" value={`${stats.accuracy}%`} colorClass="text-indigo-400" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Chart / Heatmap Area */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2 bg-surface/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-6 lg:p-8 flex flex-col min-h-[380px] relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 blur-[50px] rounded-full group-hover:bg-primary-500/10 transition-colors duration-700 pointer-events-none"></div>
            
            <div className="flex items-center justify-between mb-8 relative z-10">
              <h2 className="text-xl font-display font-bold text-white tracking-tight flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary-400" /> Activity Heatmap
              </h2>
              <select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="bg-white/5 border border-white/10 text-white text-sm rounded-xl px-4 py-2 focus:outline-none focus:border-primary-500 font-medium cursor-pointer backdrop-blur-md hover:bg-white/10 transition-colors"
              >
                <option value={currentYear} className="bg-[#161b22]">{currentYear}</option>
                <option value={currentYear - 1} className="bg-[#161b22]">{currentYear - 1}</option>
              </select>
            </div>
            
            <div className="flex-1 flex flex-col justify-center overflow-x-auto pt-10 pb-4 hide-scrollbar relative z-10">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 animate-spin text-white/40" />
                </div>
              ) : (
                <>
                  <div className="grid grid-rows-7 gap-2 w-max mx-auto" style={{ gridAutoFlow: 'column' }}>
                    {heatmapDays.map((day, idx) => (
                      <div 
                        key={idx} 
                        className={`group/tooltip relative w-3.5 h-3.5 md:w-4 md:h-4 rounded-[4px] border transition-all duration-300 cursor-pointer ${getHeatmapColor(day.count)} hover:scale-125 z-10 hover:z-20`}
                      >
                        {/* Custom sleek tooltip */}
                        <div className={`absolute px-3 py-1.5 bg-[#1e232b] text-white text-[11px] font-medium rounded-lg opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 whitespace-nowrap border border-white/10 shadow-xl pointer-events-none z-50 ${
                          idx % 7 < 2 ? 'top-full mt-2' : 'bottom-full mb-2'
                        } ${
                          idx >= heatmapDays.length - 21 ? 'right-0' : idx < 21 ? 'left-0' : 'left-1/2 -translate-x-1/2'
                        }`}>
                          <span className="text-primary-400 font-bold">{day.count}</span> submissions on {day.date}
                          <div className={`absolute border-4 border-transparent ${
                            idx % 7 < 2 ? 'bottom-full border-b-[#1e232b]' : 'top-full border-t-[#1e232b]'
                          } ${
                            idx >= heatmapDays.length - 21 ? 'right-1' : idx < 21 ? 'left-1' : 'left-1/2 -translate-x-1/2'
                          }`}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-end gap-3 mt-8 text-xs text-text-muted font-medium">
                    <span>Less</span>
                    <div className="flex gap-1.5">
                      <div className="w-3.5 h-3.5 rounded-[4px] bg-white/5 border border-white/5"></div>
                      <div className="w-3.5 h-3.5 rounded-[4px] bg-primary-500/40 border border-primary-500/20"></div>
                      <div className="w-3.5 h-3.5 rounded-[4px] bg-primary-500/70 border border-primary-500/50 shadow-[0_0_5px_rgba(99,102,241,0.3)]"></div>
                      <div className="w-3.5 h-3.5 rounded-[4px] bg-primary-400 border border-primary-300/80 shadow-[0_0_8px_rgba(99,102,241,0.6)]"></div>
                    </div>
                    <span>More</span>
                  </div>
                </>
              )}
            </div>
          </motion.div>

          {/* Languages Used Analytics */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-surface/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-6 lg:p-8 flex flex-col relative overflow-hidden group"
          >
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-indigo-500/5 blur-[40px] rounded-full pointer-events-none group-hover:bg-indigo-500/10 transition-colors duration-700"></div>
            
            <h2 className="text-xl font-display font-bold text-white tracking-tight mb-8 relative z-10 flex items-center gap-2">
              <Code2 className="w-5 h-5 text-indigo-400" /> Language Stats
            </h2>
            
            <div className="flex-1 flex flex-col justify-center gap-5 relative z-10">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 animate-spin text-white/40" />
                </div>
              ) : languageData.length > 0 ? (
                languageData.map((lang, idx) => {
                  const maxCount = Math.max(...languageData.map(l => l.count), 1);
                  const percent = (lang.count / maxCount) * 100;
                  
                  // Vibrant colors based on language
                  const colors = {
                    cpp: "from-blue-500 to-cyan-400",
                    python: "from-yellow-400 to-yellow-200 text-black",
                    javascript: "from-yellow-500 to-amber-300",
                    java: "from-orange-500 to-red-400"
                  };
                  const gradient = colors[lang.language?.toLowerCase()] || "from-primary-500 to-indigo-400";
                  
                  return (
                    <div key={idx} className="w-full group/bar">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold text-white/90 capitalize flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${gradient}`}></span>
                          {lang.language}
                        </span>
                        <span className="text-xs font-mono text-white/50">{lang.count} subs</span>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${percent}%` }}
                          transition={{ duration: 1, delay: 0.5 + (idx * 0.1), ease: "easeOut" }}
                          className={`h-full bg-gradient-to-r ${gradient} relative`}
                        >
                          <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]"></div>
                        </motion.div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-white/40 text-sm font-medium">No language data yet</div>
              )}
            </div>
          </motion.div>

          {/* Difficulty Rings */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-surface/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-6 lg:p-8 flex flex-col relative overflow-hidden group"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white/5 blur-[50px] rounded-full pointer-events-none group-hover:bg-white/10 transition-colors duration-700"></div>

            <h2 className="text-xl font-display font-bold text-white tracking-tight mb-8 relative z-10 flex items-center gap-2">
              <Target className="w-5 h-5 text-white/60" /> Difficulty Focus
            </h2>
            
            <div className="flex-1 flex flex-col items-center justify-center gap-7 relative z-10">
              {/* Easy */}
              <div className="w-full flex items-center gap-5 group/diff hover:scale-[1.02] transition-transform duration-300">
                <div className="w-14 h-14 rounded-full relative flex items-center justify-center shrink-0">
                  <svg className="w-full h-full -rotate-90 drop-shadow-[0_0_8px_rgba(34,197,94,0.4)]" viewBox="0 0 36 36">
                    <path className="text-success/10" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5" />
                    <motion.path 
                      initial={{ strokeDasharray: "0, 100" }}
                      animate={{ strokeDasharray: `${difficultyData.Easy.total > 0 ? (difficultyData.Easy.solved / difficultyData.Easy.total) * 100 : 0}, 100` }}
                      transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                      className="text-success" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" 
                    />
                  </svg>
                  <span className="absolute text-[10px] font-bold text-success">
                    {difficultyData.Easy.total > 0 ? Math.round((difficultyData.Easy.solved / difficultyData.Easy.total) * 100) : 0}%
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-base font-bold text-success drop-shadow-sm">Easy</span>
                    <span className="text-sm font-mono text-white/70 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">{difficultyData.Easy.solved} <span className="text-white/30">/ {difficultyData.Easy.total || '?'}</span></span>
                  </div>
                </div>
              </div>

              {/* Medium */}
              <div className="w-full flex items-center gap-5 group/diff hover:scale-[1.02] transition-transform duration-300">
                <div className="w-14 h-14 rounded-full relative flex items-center justify-center shrink-0">
                  <svg className="w-full h-full -rotate-90 drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]" viewBox="0 0 36 36">
                    <path className="text-warning/10" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5" />
                    <motion.path 
                      initial={{ strokeDasharray: "0, 100" }}
                      animate={{ strokeDasharray: `${difficultyData.Medium.total > 0 ? (difficultyData.Medium.solved / difficultyData.Medium.total) * 100 : 0}, 100` }}
                      transition={{ duration: 1.5, delay: 0.7, ease: "easeOut" }}
                      className="text-warning" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" 
                    />
                  </svg>
                  <span className="absolute text-[10px] font-bold text-warning">
                    {difficultyData.Medium.total > 0 ? Math.round((difficultyData.Medium.solved / difficultyData.Medium.total) * 100) : 0}%
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-base font-bold text-warning drop-shadow-sm">Medium</span>
                    <span className="text-sm font-mono text-white/70 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">{difficultyData.Medium.solved} <span className="text-white/30">/ {difficultyData.Medium.total || '?'}</span></span>
                  </div>
                </div>
              </div>

              {/* Hard */}
              <div className="w-full flex items-center gap-5 group/diff hover:scale-[1.02] transition-transform duration-300">
                <div className="w-14 h-14 rounded-full relative flex items-center justify-center shrink-0">
                  <svg className="w-full h-full -rotate-90 drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]" viewBox="0 0 36 36">
                    <path className="text-danger/10" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5" />
                    <motion.path 
                      initial={{ strokeDasharray: "0, 100" }}
                      animate={{ strokeDasharray: `${difficultyData.Hard.total > 0 ? (difficultyData.Hard.solved / difficultyData.Hard.total) * 100 : 0}, 100` }}
                      transition={{ duration: 1.5, delay: 0.9, ease: "easeOut" }}
                      className="text-danger" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" 
                    />
                  </svg>
                  <span className="absolute text-[10px] font-bold text-danger">
                    {difficultyData.Hard.total > 0 ? Math.round((difficultyData.Hard.solved / difficultyData.Hard.total) * 100) : 0}%
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-base font-bold text-danger drop-shadow-sm">Hard</span>
                    <span className="text-sm font-mono text-white/70 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">{difficultyData.Hard.solved} <span className="text-white/30">/ {difficultyData.Hard.total || '?'}</span></span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Recent Submissions */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="lg:col-span-2 bg-surface/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-6 lg:p-8 flex flex-col relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-8 relative z-10">
              <h2 className="text-xl font-display font-bold text-white tracking-tight flex items-center gap-2">
                <Server className="w-5 h-5 text-white/60" /> Recent Timeline
              </h2>
              <Link to="/submissions" className="text-xs font-bold text-white/80 hover:text-white transition-all bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl shadow-sm hover:shadow-md">View All</Link>
            </div>
            
            <div className="space-y-4 flex-1 overflow-y-auto pr-2 relative z-10 hide-scrollbar">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse border border-white/5"></div>
                ))
              ) : recentSubmissions.length > 0 ? (
                <div className="relative border-l-2 border-white/10 ml-3 pl-6 space-y-6 py-2">
                  {recentSubmissions.map((sub, i) => (
                    <motion.div 
                      key={sub._id || i}
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <div 
                        onClick={() => navigate(`/problems/${sub.problem?._id || sub.problem}/solve`)}
                        className="relative p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all cursor-pointer shadow-sm hover:shadow-md group"
                      >
                        {/* Timeline dot */}
                        <div className={`absolute top-1/2 -translate-y-1/2 -left-[31px] w-3 h-3 rounded-full border-2 border-[#0a0c10] ${sub.verdict === 'Accepted' ? 'bg-success shadow-[0_0_8px_rgba(34,197,94,0.8)]' : sub.verdict === 'Wrong Answer' ? 'bg-danger shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'bg-warning shadow-[0_0_8px_rgba(245,158,11,0.8)]'}`}></div>
                        
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-bold text-white group-hover:text-primary-400 transition-colors text-base truncate pr-4 drop-shadow-sm">{sub.problem?.title || "Unknown Problem"}</h4>
                          <span className="text-xs text-white/40 whitespace-nowrap font-medium font-mono bg-black/20 px-2 py-1 rounded-md">{timeAgo(sub.createdAt)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <StatusBadge status={sub.verdict} />
                          <span className="text-[11px] font-mono font-bold text-white/60 uppercase tracking-wider bg-white/10 border border-white/5 px-2 py-1 rounded-md shadow-sm">{sub.language}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full opacity-60 py-10">
                  <Server className="w-12 h-12 mb-4 text-white/20" />
                  <p className="text-sm font-medium text-white/60">No recent timeline events.</p>
                  <Link to="/problems" className="text-xs text-primary-400 mt-2 hover:text-primary-300 font-bold tracking-wide uppercase">Solve your first problem →</Link>
                </div>
              )}
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
