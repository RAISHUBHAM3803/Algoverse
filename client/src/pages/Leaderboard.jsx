import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Search, Crown, Activity } from "lucide-react";
import api from "../api/axios";
import Loader from "../components/common/Loader";

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await api.get("/stats/leaderboard");
        if (response.data?.success) {
          setUsers(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const getRankBadge = (index) => {
    switch (index) {
      case 0:
        return (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-500 border border-yellow-500/30">
            <Crown className="w-4 h-4" />
          </div>
        );
      case 1:
        return (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-400/20 text-slate-400 border border-slate-400/30">
            <Medal className="w-4 h-4" />
          </div>
        );
      case 2:
        return (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-600/20 text-amber-500 border border-amber-600/30">
            <Medal className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 text-white/40 font-mono text-sm font-semibold">
            {index + 1}
          </div>
        );
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="min-h-[calc(100vh-73px)] py-12 px-4 sm:px-6 relative overflow-hidden bg-[#0a0c10]">
      {/* Background Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary-600/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none"></div>

      <div className="max-w-[1000px] mx-auto relative z-10">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-500/10 border border-primary-500/20 mb-6 relative">
            <div className="absolute inset-0 bg-primary-400 blur-xl opacity-20"></div>
            <Trophy className="w-8 h-8 text-primary-400 relative z-10" />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-black text-white mb-4 tracking-tight drop-shadow-sm">
            Global <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-indigo-400">Leaderboard</span>
          </h1>
          <p className="text-text-secondary text-base md:text-lg max-w-2xl mx-auto">
            The top developers on AlgoVerse ranked by total problems solved.
          </p>
        </motion.div>

        {/* Table Container */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-surface/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-6 py-5 text-sm font-bold text-white/50 uppercase tracking-wider w-24 text-center">Rank</th>
                  <th className="px-6 py-5 text-sm font-bold text-white/50 uppercase tracking-wider">Developer</th>
                  <th className="px-6 py-5 text-sm font-bold text-white/50 uppercase tracking-wider text-right">Problems Solved</th>
                  <th className="px-6 py-5 text-sm font-bold text-white/50 uppercase tracking-wider text-right">Submissions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-white/40 font-medium">
                      No developers found. Be the first to solve a problem!
                    </td>
                  </tr>
                ) : (
                  users.map((user, index) => (
                    <motion.tr 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      key={user._id} 
                      className="group hover:bg-white/[0.03] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          {getRankBadge(index)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500/20 to-indigo-500/20 border border-white/10 flex items-center justify-center text-white font-bold shrink-0 overflow-hidden relative group-hover:border-primary-500/40 transition-colors">
                            {user.profile?.avatar ? (
                              <img src={user.profile.avatar} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-lg">{user.name.charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                          <div>
                            <div className="text-white font-bold text-base group-hover:text-primary-400 transition-colors">
                              {user.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary-500/10 border border-primary-500/20 text-primary-400 font-mono font-bold">
                          <Target className="w-3.5 h-3.5 opacity-60 hidden sm:block" />
                          {user.stats?.solvedCount || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="text-white/60 font-mono text-sm">
                          {user.stats?.totalSubmissions || 0}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Simple target icon for problems solved
const Target = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
);

export default Leaderboard;
