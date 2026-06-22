import React from "react";
import { Link } from "react-router-dom";
import { ExternalLink, Code2 } from "lucide-react";
import AlgoVerseLogo from "../common/AlgoVerseLogo";

const Footer = () => {
  return (
    <footer className="bg-[#0a0c10] pt-16 pb-8 mt-auto relative z-10 overflow-hidden">
      {/* Top Gradient Divider */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
      
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary-600/5 blur-[120px] pointer-events-none rounded-full" />
      
      <div className="max-w-[1200px] mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          
          <div className="md:col-span-5 pr-0 md:pr-12">
            <Link to="/" className="flex items-center gap-2 mb-6 group hover:opacity-90 transition-opacity">
              <AlgoVerseLogo size={26} showBadge={false} icon="terminal-rounded" />
            </Link>
            <p className="text-white/50 text-sm leading-relaxed max-w-sm mb-8">
              Practice smarter. Code faster. Land your dream job.
              The premium platform built for developers who take technical interviews seriously.
            </p>
            <div className="flex items-center gap-4">
              <SocialLink href="https://github.com/RAISHUBHAM3803" icon={<GithubIcon size={18} />} label="GitHub" />
              <SocialLink href="https://www.linkedin.com/in/shubham-rai-b7878a290/" icon={<LinkedinIcon size={18} />} label="LinkedIn" />
            </div>
          </div>

          <div className="md:col-span-3 md:col-start-7">
            <h3 className="text-white font-semibold mb-6 text-xs uppercase tracking-widest">Platform</h3>
            <ul className="space-y-4">
              <FooterLink to="/">Home</FooterLink>
              <FooterLink to="/problems">Problem Library</FooterLink>
              <FooterLink to="/leaderboard">Leaderboard</FooterLink>
              <FooterLink to="/dashboard">Dashboard</FooterLink>
            </ul>
          </div>
          
          <div className="md:col-span-3">
            <h3 className="text-white font-semibold mb-6 text-xs uppercase tracking-widest">Legal</h3>
            <ul className="space-y-4">
              <FooterLink to="/privacy">Privacy Policy</FooterLink>
              <FooterLink to="/terms">Terms of Service</FooterLink>
            </ul>
          </div>

        </div>
        
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="flex items-center gap-1.5 text-white/40 text-sm">
            <span>&copy; {new Date().getFullYear()} AlgoVerse. All rights reserved.</span>
          </p>
          <p className="flex items-center gap-1.5 text-white/40 text-sm">
            <span>Crafted by</span>
            <a 
              href="https://github.com/RAISHUBHAM3803" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-primary-400 hover:text-primary-300 font-medium hover:underline inline-flex items-center gap-1 transition-colors"
            >
              Shubham Rai <ExternalLink size={12} />
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

const FooterLink = ({ to, children }) => (
  <li>
    <Link to={to} className="text-white/50 hover:text-primary-400 transition-colors text-sm font-medium">
      {children}
    </Link>
  </li>
);

const SocialLink = ({ href, icon, label }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className="w-9 h-9 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center text-white/50 hover:text-primary-400 hover:border-primary-500/30 hover:bg-primary-500/10 transition-all hover:-translate-y-0.5"
  >
    {icon}
  </a>
);

const GithubIcon = ({ size = 24, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
    <path d="M9 18c-4.51 2-5-2-7-2"/>
  </svg>
);

const LinkedinIcon = ({ size = 24, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect width="4" height="12" x="2" y="9"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);

export default Footer;
