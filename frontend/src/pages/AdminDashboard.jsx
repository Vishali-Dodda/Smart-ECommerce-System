import { Link } from "react-router-dom"

function AdminDashboard() {
  return (
    <main className="admin-page">

      <section className="admin-container">

        <div className="admin-heading">
          <h1>
            Admin Dashboard
          </h1>

          <p>
            Manage ShopFusion products,
            inventory, categories and orders.
          </p>
        </div>


        <div className="admin-grid">

          <Link
            to="/admin/products"
            className="admin-card admin-card-link"
          >
            <h2>
              Products
            </h2>

            <p>
              Manage products and product information.
            </p>

            <span>
              Manage Products →
            </span>
          </Link>


          <Link
            to="/admin/categories"
            className="admin-card admin-card-link"
          >
            <h2>
              Categories
            </h2>

            <p>
              Manage product categories.
            </p>

            <span>
              Manage Categories →
            </span>
          </Link>


          <Link
            to="/admin/inventory"
            className="admin-card admin-card-link"
          >
            <h2>
                Inventory
            </h2>

            <p>
                Monitor and update product stock.
            </p>

            <span>
                Manage Inventory →
            </span>
          </Link>


          <Link
            to="/admin/orders"
            className="admin-card admin-card-link"
          >
            <h2>
              Orders
            </h2>

            <p>
              View and manage customer orders.
            </p>

            <span>
              Manage Orders →
            </span>
          </Link>

        </div>

      </section>

    </main>
  )
}

export default AdminDashboard