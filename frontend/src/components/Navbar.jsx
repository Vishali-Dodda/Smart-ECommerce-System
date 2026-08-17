import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

function Navbar() {
  const {
    user,
    isAuthenticated,
    logout,
  } = useAuth()

  return (
    <nav className="navbar">

      {/* Logo */}

      <div className="navbar-brand">
        <Link to="/">
          ShopFusion
        </Link>
      </div>


      {/* Main Navigation */}

      <div className="navbar-links">

        <Link to="/">
          Home
        </Link>

        <Link to="/products">
          Products
        </Link>

        <Link to="/categories">
          Categories
        </Link>

        <Link to="/orders">
          Orders
        </Link>

      </div>


      {/* Account Actions */}

      <div className="navbar-actions">

        <Link to="/cart">
          Cart
        </Link>


        {isAuthenticated ? (

          <div className="navbar-account">

            <Link
              to="/account"
              className="account-link"
            >
              👤 {user?.username || "Account"}
            </Link>

            <button
              className="logout-button"
              onClick={logout}
            >
              Logout
            </button>

          </div>

        ) : (

          <Link to="/login">
            Login
          </Link>

        )}

      </div>

    </nav>
  )
}

export default Navbar