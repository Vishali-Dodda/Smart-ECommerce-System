import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

function AdminRoute({ children }) {
  const {
    user,
    isAuthenticated,
    loading,
  } = useAuth()

  const location = useLocation()


  // =========================
  // CHECKING AUTHENTICATION
  // =========================

  if (loading) {
    return (
      <main className="auth-page">
        <p>Checking authentication...</p>
      </main>
    )
  }


  // =========================
  // NOT LOGGED IN
  // =========================

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    )
  }


  // =========================
  // NOT AN ADMIN
  // =========================

  if (!user?.is_staff) {
    return (
      <Navigate
        to="/"
        replace
      />
    )
  }


  // =========================
  // ADMIN
  // =========================

  return children
}

export default AdminRoute