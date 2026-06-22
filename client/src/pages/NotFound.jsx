import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, SearchX } from "lucide-react";
import { motion } from "framer-motion";

const NotFound = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 min-h-[80vh] relative z-10 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 flex items-center justify-center -z-10 pointer-events-none">
        <div className="text-[300px] md:text-[400px] font-black font-display text-text-muted/5 select-none absolute">404</div>
        <div className="w-[500px] h-[500px] bg-danger/5 rounded-full blur-[100px] mix-blend-screen"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-lg glass-panel p-10 md:p-14"
      >
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-danger/10 border border-danger/20 rounded-2xl flex items-center justify-center shadow-sm">
            <SearchX className="text-danger w-10 h-10" />
          </div>
        </div>
        
        <h1 className="font-semibold text-danger text-sm uppercase tracking-widest mb-4">Error 404</h1>
        <h2 className="text-3xl md:text-4xl font-display font-bold text-text-primary mb-4 tracking-tight">Page not found</h2>
        
        <p className="text-text-secondary mb-10 text-base leading-relaxed">
          The page you're looking for doesn't exist, has been removed, or is temporarily unavailable. Please check the URL or return to the dashboard.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/" className="btn-lc-primary px-6 py-3 w-full sm:w-auto gap-2">
            <ArrowLeft className="w-5 h-5" /> Return Home
          </Link>
          <button 
            onClick={() => window.history.back()}
            className="btn-lc-secondary px-6 py-3 w-full sm:w-auto"
          >
            Go Back
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
