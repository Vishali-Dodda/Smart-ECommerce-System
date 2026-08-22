import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import api from "../services/api"

function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")


  // =========================
  // FETCH ORDERS
  // =========================

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        setError("")

        const response = await api.get(
          "/orders/"
        )

        setOrders(
          response.data.results ||
          response.data
        )

      } catch (error) {
        console.error(
          "Failed to fetch orders:",
          error
        )

        if (
          error.response?.data?.detail
        ) {
          setError(
            error.response.data.detail
          )
        } else {
          setError(
            "Unable to load your orders."
          )
        }

      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])


  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <main className="orders-page">

        <div className="orders-container">

          <p>
            Loading your orders...
          </p>

        </div>

      </main>
    )
  }


  // =========================
  // ERROR
  // =========================

  if (error) {
    return (
      <main className="orders-page">

        <div className="orders-container">

          <div className="orders-error">

            <h1>
              Unable to load orders
            </h1>

            <p>
              {error}
            </p>

          </div>

        </div>

      </main>
    )
  }


  // =========================
  // EMPTY ORDERS
  // =========================

  if (orders.length === 0) {
    return (
      <main className="orders-page">

        <div className="orders-container">

          <div className="orders-heading">

            <h1>
              My Orders
            </h1>

            <p>
              View and track your orders.
            </p>

          </div>


          <div className="orders-empty">

            <div className="orders-empty-icon">
              📦
            </div>

            <h2>
              No orders yet
            </h2>

            <p>
              You haven't placed any orders yet.
            </p>

            <Link
              to="/products"
              className="orders-shop-button"
            >
              Start Shopping
            </Link>

          </div>

        </div>

      </main>
    )
  }


  // =========================
  // ORDERS PAGE
  // =========================

  return (
    <main className="orders-page">

      <div className="orders-container">

        {/* Heading */}

        <div className="orders-heading">

          <div>

            <h1>
              My Orders
            </h1>

            <p>
              View and track your orders.
            </p>

          </div>

          <span className="orders-count">
            {orders.length}{" "}
            {orders.length === 1
              ? "Order"
              : "Orders"}
          </span>

        </div>


        {/* Orders */}

        <div className="orders-list">

          {orders.map((order) => {

            const total =
              Number(order.total_amount)

            const itemCount =
              order.items?.reduce(
                (
                  totalItems,
                  item
                ) =>
                  totalItems +
                  item.quantity,
                0
              ) || 0


            const orderDate =
              order.created_at
                ? new Date(
                    order.created_at
                  ).toLocaleDateString(
                    "en-IN",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }
                  )
                : "—"


            return (
              <article
                className="order-card"
                key={order.id}
              >

                {/* Order Header */}

                <div className="order-card-top">

                  <div>

                    <span className="order-card-label">
                      Order
                    </span>

                    <h2>
                      #{order.id}
                    </h2>

                  </div>


                  <span
                    className={`order-status-badge status-${String(
                      order.status
                    ).toLowerCase()}`}
                  >
                    {order.status}
                  </span>

                </div>


                {/* Order Information */}

                <div className="order-card-info">

                  <div>

                    <span>
                      Order Date
                    </span>

                    <strong>
                      {orderDate}
                    </strong>

                  </div>


                  <div>

                    <span>
                      Items
                    </span>

                    <strong>
                      {itemCount}{" "}
                      {itemCount === 1
                        ? "item"
                        : "items"}
                    </strong>

                  </div>


                  <div>

                    <span>
                      Total
                    </span>

                    <strong>
                      ₹
                      {total.toLocaleString(
                        "en-IN"
                      )}
                    </strong>

                  </div>

                </div>


                {/* Products Preview */}

                {order.items &&
                  order.items.length > 0 && (

                    <div className="order-products-preview">

                      {order.items
                        .slice(0, 3)
                        .map(
                          (item) => (

                            <div
                              className="order-product-preview"
                              key={item.id}
                            >

                              <span>
                                {item.product_name}
                              </span>

                              <span>
                                ×{" "}
                                {item.quantity}
                              </span>

                            </div>

                          )
                        )}

                      {order.items.length >
                        3 && (

                        <span className="more-order-items">
                          +
                          {order.items.length -
                            3}{" "}
                          more
                        </span>

                      )}

                    </div>

                  )}


                {/* Action */}

                <div className="order-card-actions">

                  <Link
                    to={`/orders/${order.id}`}
                    className="view-order-button"
                  >
                    View Order
                  </Link>

                </div>

              </article>
            )
          })}

        </div>

      </div>

    </main>
  )
}

export default Orders