// 404 — quietly redirect home. Knowhere is single-surface; stale links shouldn't
// dead-end users.

import { Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.warn("Knowhere: unknown route, redirecting to /", location.pathname);
  }, [location.pathname]);

  return <Navigate to="/" replace />;
};

export default NotFound;
