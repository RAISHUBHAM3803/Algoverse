import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import ProtectedRoute from "../components/common/ProtectedRoute";
import Loader from "../components/common/Loader";

// Eager
import Home from "../pages/Home";
import NotFound from "../pages/NotFound";

// Lazy — loaded only when needed
const Login            = lazy(() => import("../pages/Login"));
const Register         = lazy(() => import("../pages/Register"));
const Leaderboard      = lazy(() => import("../pages/Leaderboard"));
const Dashboard        = lazy(() => import("../pages/Dashboard"));
const Problems         = lazy(() => import("../pages/Problems"));
const ProblemDetails   = lazy(() => import("../pages/ProblemDetails"));
const SolveProblem     = lazy(() => import("../pages/SolveProblem"));
const SubmissionHistory = lazy(() => import("../pages/SubmissionHistory"));
const SubmissionView   = lazy(() => import("../pages/SubmissionView"));
const Profile          = lazy(() => import("../pages/Profile"));

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Public Routes */}
        <Route path="/"            element={<Home />} />
        <Route path="/leaderboard" element={<Suspense fallback={<Loader fullScreen />}><Leaderboard /></Suspense>} />
        <Route path="/login"       element={<Suspense fallback={<Loader fullScreen />}><Login /></Suspense>} />
        <Route path="/register"    element={<Suspense fallback={<Loader fullScreen />}><Register /></Suspense>} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Suspense fallback={<Loader fullScreen />}><Dashboard /></Suspense>} />

          {/* Phase 2 — Problems */}
          <Route path="/problems" element={
            <Suspense fallback={<Loader fullScreen />}>
              <Problems />
            </Suspense>
          } />
          <Route path="/problems/:id" element={
            <Suspense fallback={<Loader fullScreen />}>
              <ProblemDetails />
            </Suspense>
          } />

          {/* Phase 3 — Code Editor & Submissions */}
          <Route path="/problems/:id/solve" element={
            <Suspense fallback={<Loader fullScreen />}>
              <SolveProblem />
            </Suspense>
          } />
          <Route path="/submissions" element={
            <Suspense fallback={<Loader fullScreen />}>
              <SubmissionHistory />
            </Suspense>
          } />
          <Route path="/submissions/:id" element={
            <Suspense fallback={<Loader fullScreen />}>
              <SubmissionView />
            </Suspense>
          } />
          <Route path="/profile" element={
            <Suspense fallback={<Loader fullScreen />}>
              <Profile />
            </Suspense>
          } />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
