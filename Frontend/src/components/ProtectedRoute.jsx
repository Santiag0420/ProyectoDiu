import React, { useContext, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { CounterUser } from "../Context/CounterUser";

export const ProtectedRoute = ({ allowedRoles, children, navigateTo="/home" }) => {
  const { user, setUser } = useContext(CounterUser);
  try {
    setUser(JSON.parse(user));
  } catch (error) {

  }
  if (!user) {
    return <Navigate to="/login" />
  } else if (!allowedRoles.includes(user.rol)) {
    return <Navigate to={navigateTo} />
  }

  return children ? children : <Outlet />;

};
