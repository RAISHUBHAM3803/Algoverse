import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectIsAuthenticated, selectUser } from "../../features/auth/authSelectors";
import { logout } from "../../features/auth/authSlice";
import {
  LogOut, Menu, X, Hexagon, User, LayoutDashboard,
  Code, ChevronDown, Search, Flame, CheckCircle, Loader2,
  Trophy, ArrowRight, Hash, BookOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/axios";
import AlgoVerseLogo from "../common/AlgoVerseLogo";

// ─── Command Palette / Global Search ────────────────────────────────────────
const CommandPalette = ({ open, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const search = useCallback(async (q) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await api.get(`/problems?search=${encodeURIComponent(q)}&limit=8`);
      setResults(res.data?.data || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 300);
  };

  const handleSelect = (problem) => {
    onClose();
    navigate(`/problems/${problem._id}`);
  };

  const diffColor = { Easy: "text-green-400", Medium: "text-amber-400", Hard: "text-red-400" };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[998]"
          />
          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -20 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-xl z-[999] px-4"
          >
            <div className="bg-[#13161d] border border-white/10 rounded-2xl shadow-[0_25px_80px_rgba(0,0,0,0.6)] overflow-hidden">
              {/* Search Input */}
              <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10">
                <Search className="w-5 h-5 text-white/40 flex-shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={handleChange}
                  placeholder="Search problems by name..."
                  className="flex-1 bg-transparent text-white text-base placeholder-white/30 outline-none"
                />
                {loading && <Loader2 className="w-4 h-4 text-white/40 animate-spin flex-shrink-0" />}
                <kbd className="hidden sm:inline-flex items-center px-2 py-1 rounded-md bg-white/5 text-white/30 text-xs border border-white/10">Esc</kbd>
              </div>

              {/* Results */}
              {results.length > 0 && (
                <div className="py-2 max-h-80 overflow-y-auto">
                  {results.map((p, i) => (
                    <button
                      key={p._id}
                      onClick={() => handleSelect(p)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                        <Hash className="w-3.5 h-3.5 text-white/30" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate group-hover:text-primary-400 transition-colors">{p.title}</p>
                        <p className={`text-xs font-medium ${diffColor[p.difficulty] || "text-white/40"}`}>{p.difficulty}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-primary-400 flex-shrink-0 transition-colors" />
                    </button>
                  ))}
                </div>
              )}

              {query && !loading && results.length === 0 && (
                <div className="py-10 text-center">
                  <BookOpen className="w-8 h-8 text-white/20 mx-auto mb-2" />
                  <p className="text-white/40 text-sm">No problems found for "{query}"</p>
                </div>
              )}

              {!query && (
                <div className="px-4 py-5">
                  <p className="text-[11px] uppercase tracking-widest text-white/30 font-bold mb-3">Quick Actions</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "All Problems", to: "/problems", icon: <BookOpen className="w-4 h-4" /> },
                      { label: "Dashboard", to: "/dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
                      { label: "Submissions", to: "/submissions", icon: <Code className="w-4 h-4" /> },
                      { label: "Profile", to: "/profile", icon: <User className="w-4 h-4" /> },
                    ].map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={onClose}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 text-white/50 hover:text-white text-sm transition-all duration-200"
                      >
                        {item.icon}
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer hint */}
              <div className="px-4 py-2.5 border-t border-white/5 flex items-center gap-4">
                <span className="text-[11px] text-white/20 flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10">↵</kbd> to select
                </span>
                <span className="text-[11px] text-white/20 flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10">Esc</kbd> to close
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ─── Main Navbar ─────────────────────────────────────────────────────────────
const Navbar = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Scroll detection
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 10);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  }, [location.pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ⌘K / Ctrl+K global shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape") setSearchOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  // Stats — fully live from Redux (currentStreak returned by auth/me)
  const streak = user?.currentStreak ?? 0;
  const solved = user?.stats?.solvedCount ?? 0;

  return (
    <>
      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />

      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#0a0c10]/90 backdrop-blur-xl border-b border-white/8 py-3 shadow-[0_1px_30px_rgba(0,0,0,0.3)]"
            : "bg-transparent border-b border-transparent py-4"
        }`}
      >
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="flex justify-between items-center">

            {/* ── Logo ─────────────────────────────────────── */}
            <Link to="/" className="flex-shrink-0 flex items-center group hover:opacity-90 transition-opacity">
              <AlgoVerseLogo size={28} icon="terminal-rounded" />
            </Link>

            {/* ── Desktop Center Nav ────────────────────────── */}
            <div className="hidden md:flex items-center gap-1">
              <NavLink to="/" active={isActive("/")}>Home</NavLink>
              <NavLink to="/problems" active={isActive("/problems")}>Problems</NavLink>
              <NavLink to="/leaderboard" active={isActive("/leaderboard")}>Leaderboard</NavLink>
              {isAuthenticated && (
                <NavLink to="/dashboard" active={isActive("/dashboard")}>Dashboard</NavLink>
              )}
            </div>

            {/* ── Desktop Right Section ─────────────────────── */}
            <div className="hidden md:flex items-center gap-3">

              {/* Search trigger */}
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/8 border border-white/10 hover:border-white/20 text-white/40 hover:text-white/70 transition-all duration-200 text-sm"
              >
                <Search className="w-4 h-4" />
                <span className="hidden lg:inline text-sm">Search problems...</span>
                <kbd className="hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/10 border border-white/10 text-[10px] text-white/30 font-mono">
                  ⌘K
                </kbd>
              </button>

              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  {/* Streak badge */}
                  {streak > 0 && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-bold group cursor-default transition-colors hover:bg-amber-500/20">
                      <Flame className="w-4 h-4 group-hover:animate-pulse drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]" />
                      {streak}
                    </div>
                  )}

                  {/* Solved badge */}
                  <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-success/10 border border-success/20 text-success text-sm font-bold">
                    <CheckCircle className="w-3.5 h-3.5" />
                    {solved}
                  </div>

                  <div className="h-5 w-px bg-white/10" />

                  {/* Profile Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                      className="flex items-center gap-2 hover:opacity-90 transition-opacity focus:outline-none group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-[0_0_15px_rgba(99,102,241,0.3)] group-hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-shadow">
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <ChevronDown className={`w-4 h-4 text-white/40 transition-transform duration-200 ${profileDropdownOpen ? "rotate-180" : ""}`} />
                    </button>

                    <AnimatePresence>
                      {profileDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-3 w-60 bg-[#13161d] border border-white/10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden"
                        >
                          {/* User info header */}
                          <div className="px-4 py-4 border-b border-white/8">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                                {user?.name?.charAt(0).toUpperCase() || "U"}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                                <p className="text-xs text-white/40 truncate">{user?.email}</p>
                              </div>
                            </div>
                            {/* Mini stats */}
                            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/5">
                              <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold">
                                <Flame className="w-3.5 h-3.5" />
                                {streak} day{streak !== 1 ? "s" : ""}
                              </div>
                              <div className="w-px h-3 bg-white/10" />
                              <div className="flex items-center gap-1.5 text-xs text-success font-semibold">
                                <CheckCircle className="w-3.5 h-3.5" />
                                {solved} solved
                              </div>
                              <div className="w-px h-3 bg-white/10" />
                              <div className="flex items-center gap-1.5 text-xs text-primary-400 font-semibold">
                                <Trophy className="w-3.5 h-3.5" />
                                {user?.stats?.totalSubmissions ?? 0} sub
                              </div>
                            </div>
                          </div>

                          {/* Nav items */}
                          <div className="p-2">
                            <DropdownItem to="/dashboard" icon={<LayoutDashboard size={15} />}>Dashboard</DropdownItem>
                            <DropdownItem to="/submissions" icon={<Code size={15} />}>Submissions</DropdownItem>
                            <DropdownItem to="/profile" icon={<User size={15} />}>Profile</DropdownItem>
                          </div>

                          {/* Logout */}
                          <div className="p-2 border-t border-white/8">
                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                            >
                              <LogOut size={15} />
                              Sign out
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link to="/login" className="text-sm font-medium text-white/60 hover:text-white transition-colors px-3 py-2">
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="text-sm font-bold text-white bg-primary-600 hover:bg-primary-500 px-5 py-2 rounded-xl transition-all duration-200 shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)]"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>

            {/* ── Mobile Menu Button ────────────────────────── */}
            <div className="md:hidden flex items-center gap-3">
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 text-white/40 hover:text-white rounded-xl hover:bg-white/5 transition-all"
              >
                <Search className="w-5 h-5" />
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-white hover:bg-white/5 rounded-xl transition-all"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile Menu ───────────────────────────────────── */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-white/8 bg-[#0a0c10]/95 backdrop-blur-xl overflow-hidden"
            >
              <div className="px-6 py-6 flex flex-col gap-3">
                <MobileNavLink to="/">Home</MobileNavLink>
                <MobileNavLink to="/problems">Problems</MobileNavLink>
                <MobileNavLink to="/leaderboard">Leaderboard</MobileNavLink>

                <div className="h-px w-full bg-white/8 my-2" />

                {isAuthenticated ? (
                  <>
                    <MobileNavLink to="/dashboard">Dashboard</MobileNavLink>
                    <MobileNavLink to="/submissions">Submissions</MobileNavLink>
                    <MobileNavLink to="/profile">Profile</MobileNavLink>

                    {/* Mobile user card */}
                    <div className="mt-2 p-4 bg-white/[0.03] rounded-2xl border border-white/8">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                            {user?.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="block text-white font-semibold text-sm">{user?.name}</span>
                            <span className="block text-xs text-white/40">{user?.email}</span>
                          </div>
                        </div>
                        <button onClick={handleLogout} className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">
                          <LogOut className="w-5 h-5" />
                        </button>
                      </div>
                      {/* Mobile stats */}
                      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5">
                        <span className="flex items-center gap-1.5 text-xs text-amber-400 font-bold">
                          <Flame className="w-3.5 h-3.5" />{streak} day streak
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-success font-bold">
                          <CheckCircle className="w-3.5 h-3.5" />{solved} solved
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col gap-3 mt-2">
                    <Link to="/login" className="w-full text-center py-3 rounded-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/5 transition-all font-medium text-sm">
                      Sign In
                    </Link>
                    <Link to="/register" className="w-full text-center py-3 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-sm transition-all">
                      Get Started for Free
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
};

// ─── Sub-components ──────────────────────────────────────────────────────────
const NavLink = ({ to, active, children }) => (
  <Link
    to={to}
    className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
      active
        ? "text-primary-400"
        : "text-white/50 hover:text-white hover:bg-white/5"
    }`}
  >
    {children}
    {active && (
      <motion.div
        layoutId="navbar-indicator"
        className="absolute bottom-0 left-3 right-3 h-[3px] bg-primary-500 rounded-t-full shadow-[0_-2px_10px_rgba(99,102,241,0.5)]"
        initial={false}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />
    )}
  </Link>
);

const MobileNavLink = ({ to, children }) => (
  <Link to={to} className="text-white/70 hover:text-white transition-colors text-base font-medium py-1.5">
    {children}
  </Link>
);

const DropdownItem = ({ to, icon, children }) => (
  <Link
    to={to}
    className="flex items-center gap-3 px-3 py-2.5 text-sm text-white/50 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200"
  >
    <span className="text-white/30">{icon}</span>
    {children}
  </Link>
);

export default Navbar;
