import { useEffect, useState } from "react"
import { Link, useParams, useLocation } from "react-router-dom"
import api from "../services/api"

function OrderDetails() {
  const { id } = useParams()
  const location = useLocation()

  const [order, setOrder] = useState(
    location.state?.order || null
  )

  const [loading, setLoading] = useState(
    !location.state?.order
  )

  const [error, setError] = useState("")


  // =========================
  // FETCH ORDER
  // =========================

  useEffect(() => {
    const fetchOrder = async () => {
      // If checkout already supplied
      // the order, we don't need to
      // fetch it again.

      if (order) {
        return
      }

      try {
        setLoading(true)
        setError("")

        const response = await api.get(
          `/orders/${id}/`
        )

        setOrder(response.data)

      } catch (error) {
        console.error(
          "Failed to fetch order:",
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
            "Unable to load order details."
          )
        }

      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [id, order])


  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <main className="order-details-page">

        <div className="order-details-container">

          <p>
            Loading order details...
          </p>

        </div>

      </main>
    )
  }


  // =========================
  // ERROR
  // =========================

  if (error || !order) {
    return (
      <main className="order-details-page">

        <div className="order-details-container">

          <div className="order-details-error">

            <h1>
              Unable to load order
            </h1>

            <p>
              {error ||
                "The requested order could not be found."}
            </p>

            <Link
              to="/orders"
              className="order-action-button"
            >
              View My Orders
            </Link>

          </div>

        </div>

      </main>
    )
  }


  // =========================
  // TOTAL
  // =========================

  const totalAmount =
    Number(order.total_amount)


  // =========================
  // ORDER DETAILS
  // =========================

  return (
    <main className="order-details-page">

      <div className="order-details-container">

        {/* =========================
            SUCCESS HEADER
        ========================= */}

        <section className="order-success">

          <div className="order-success-icon">
            ✓
          </div>

          <h1>
            Order Placed Successfully!
          </h1>

          <p>
            Thank you for your order.
            Your order has been received
            and is being processed.
          </p>

          <div className="order-number">
            Order #{order.id}
          </div>

        </section>


        <div className="order-details-layout">

          {/* =========================
              ORDER ITEMS
          ========================= */}

          <section className="order-items-card">

            <div className="order-card-heading">

              <h2>
                Order Items
              </h2>

              <span>
                {order.items?.length || 0}{" "}
                {order.items?.length === 1
                  ? "item"
                  : "items"}
              </span>

            </div>


            <div className="order-items-list">

              {order.items?.map(
                (item) => {

                  const price =
                    Number(item.price)

                  const subtotal =
                    Number(item.subtotal)


                  return (
                    <div
                      className="order-item"
                      key={item.id}
                    >

                      <div className="order-item-image">
                        <span>
                          No Image
                        </span>
                      </div>


                      <div className="order-item-info">

                        <h3>
                          {item.product_name}
                        </h3>

                        <p>
                          Quantity:{" "}
                          {item.quantity}
                        </p>

                        <p>
                          ₹
                          {price.toLocaleString(
                            "en-IN"
                          )}{" "}
                          each
                        </p>

                      </div>


                      <strong className="order-item-total">
                        ₹
                        {subtotal.toLocaleString(
                          "en-IN"
                        )}
                      </strong>

                    </div>
                  )
                }
              )}

            </div>

          </section>


          {/* =========================
              ORDER SUMMARY
          ========================= */}

          <aside className="order-summary-card">

            <h2>
              Order Summary
            </h2>


            <div className="order-summary-row">

              <span>
                Subtotal
              </span>

              <span>
                ₹
                {totalAmount.toLocaleString(
                  "en-IN"
                )}
              </span>

            </div>


            <div className="order-summary-row">

              <span>
                Shipping
              </span>

              <span>
                Free
              </span>

            </div>


            <div className="order-summary-divider"></div>


            <div className="order-summary-total">

              <span>
                Total
              </span>

              <strong>
                ₹
                {totalAmount.toLocaleString(
                  "en-IN"
                )}
              </strong>

            </div>


            <div className="order-status">

              <span>
                Status
              </span>

              <strong>
                {order.status}
              </strong>

            </div>

          </aside>

        </div>


        {/* =========================
            DELIVERY INFORMATION
        ========================= */}

        <section className="delivery-details-card">

          <h2>
            Delivery Information
          </h2>


          <div className="delivery-grid">

            <div>

              <span>
                Full Name
              </span>

              <strong>
                {order.full_name}
              </strong>

            </div>


            <div>

              <span>
                Phone
              </span>

              <strong>
                {order.phone}
              </strong>

            </div>


            <div>

              <span>
                Address
              </span>

              <strong>
                {order.address}
              </strong>

            </div>


            <div>

              <span>
                Location
              </span>

              <strong>
                {order.city},{" "}
                {order.state} -{" "}
                {order.pincode}
              </strong>

            </div>

          </div>

        </section>


        {/* =========================
            ACTIONS
        ========================= */}

        <div className="order-actions">

          <Link
            to="/orders"
            className="order-action-button secondary"
          >
            View My Orders
          </Link>

          <Link
            to="/products"
            className="order-action-button"
          >
            Continue Shopping
          </Link>

        </div>

      </div>

    </main>
  )
}

export default OrderDetails