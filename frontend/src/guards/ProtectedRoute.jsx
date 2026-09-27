/* eslint-disable react/prop-types */

import React, { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import PageLoader from "../components/system/PageLoader";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, authenticated } = useContext(AuthContext);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setChecked(true);
  }, [user, authenticated]);

  if (loading) {
    return <PageLoader message="Checking your session…" />;
  }

  if (checked && !authenticated) {
    return <Navigate to="/login" replace />;
  }

  if (checked && allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;

