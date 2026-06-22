import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { AnimatePresence, motion } from "framer-motion";

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
};

const MainLayout = () => {
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen bg-background font-sans text-text-primary relative overflow-hidden transition-colors duration-300">
      <Navbar />

      <main className="flex-grow flex flex-col pt-[72px] relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="flex flex-col flex-1"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {!location.pathname.includes('/solve') && <Footer />}
    </div>
  );
};

export default MainLayout;
