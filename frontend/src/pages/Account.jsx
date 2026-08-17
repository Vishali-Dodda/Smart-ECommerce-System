import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

function Account() {
  const { user, logout } = useAuth()

  if (!user) {
    return (
      <main className="account-page">
        <div className="account-card">
          <p>Loading account...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="account-page">
      <div className="account-container">

        {/* Page Heading */}

        <div className="account-heading">
          <h1>My Account</h1>

          <p>
            Manage your ShopFusion account.
          </p>
        </div>


        {/* Profile Card */}

        <section className="profile-card">

          <div className="profile-avatar">
            {user.username
              .charAt(0)
              .toUpperCase()}
          </div>

          <div className="profile-info">
            <h2>{user.username}</h2>

            <p>{user.email}</p>
          </div>

        </section>


        {/* Account Options */}

        <section className="account-options">

          <Link
            to="/orders"
            className="account-option"
          >
            <div>
              <h3>My Orders</h3>

              <p>
                View your previous and current orders.
              </p>
            </div>

            <span>→</span>
          </Link>


          <Link
            to="/cart"
            className="account-option"
          >
            <div>
              <h3>My Cart</h3>

              <p>
                View and manage items in your cart.
              </p>
            </div>

            <span>→</span>
          </Link>


          <Link
            to="/products"
            className="account-option"
          >
            <div>
              <h3>Continue Shopping</h3>

              <p>
                Explore our products and categories.
              </p>
            </div>

            <span>→</span>
          </Link>

        </section>


        {/* Logout */}

        <button
          className="account-logout"
          onClick={logout}
        >
          Logout
        </button>

      </div>
    </main>
  )
}

export default Account