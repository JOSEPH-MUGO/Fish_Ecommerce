//client/src/components/ProtectedRoute.js
"use client"
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { loading, isAuthenticated, isAdmin } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner w-12 h-12"></div>
      </div>
    )
  }

  if (!isAuthenticated()) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (adminOnly && !isAdmin()) {
    // Redirect to home if user is not admin
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute
