import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import api from "../services/api"

function AdminOrders() {
  const [orders, setOrders] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  const [selectedOrder, setSelectedOrder] =
    useState(null)

  const [updating, setUpdating] =
    useState(false)


  // =========================
  // FETCH ALL ORDERS
  // =========================

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError("")

      let allOrders = []
      let url = "/orders/admin/"

      while (url) {
        const response = await api.get(url)

        const results =
          response.data.results ||
          response.data

        allOrders = [
          ...allOrders,
          ...results,
        ]

        url = response.data.next
      }

      setOrders(allOrders)

    } catch (error) {
      console.error(
        "Failed to fetch orders:",
        error
      )

      setError(
        error.response?.data?.detail ||
        "Unable to load orders."
      )

    } finally {
      setLoading(false)
    }
  }


  // =========================
  // INITIAL LOAD
  // =========================

  useEffect(() => {
    fetchOrders()
  }, [])


  // =========================
  // OPEN ORDER
  // =========================

  const openOrder = async (order) => {
    try {
      setError("")
      setMessage("")

      const response = await api.get(
        `/orders/admin/${order.id}/`
      )

      setSelectedOrder(
        response.data
      )

    } catch (error) {
      console.error(
        "Failed to fetch order details:",
        error
      )

      setError(
        error.response?.data?.detail ||
        "Unable to load order details."
      )
    }
  }


  // =========================
  // CLOSE ORDER
  // =========================

  const closeOrder = () => {
    setSelectedOrder(null)
  }


  // =========================
  // GET NEXT STATUS
  // =========================

  const getNextStatus = (status) => {
    const transitions = {
      PENDING: "CONFIRMED",
      CONFIRMED: "SHIPPED",
      SHIPPED: "DELIVERED",
    }

    return transitions[status] || null
  }


  // =========================
  // UPDATE STATUS
  // =========================

  const handleStatusUpdate = async () => {
    if (!selectedOrder) {
      return
    }

    const nextStatus =
      getNextStatus(
        selectedOrder.status
      )

    if (!nextStatus) {
      return
    }

    try {
      setUpdating(true)
      setError("")
      setMessage("")

      const response =
        await api.put(
          `/orders/admin/${selectedOrder.id}/`,
          {
            status: nextStatus,
          }
        )

      setSelectedOrder(
        response.data
      )

      setMessage(
        `Order status updated to ${nextStatus}.`
      )

      await fetchOrders()

    } catch (error) {
      console.error(
        "Failed to update order:",
        error
      )

      setError(
        error.response?.data?.detail ||
        "Unable to update order status."
      )

    } finally {
      setUpdating(false)
    }
  }


  // =========================
  // STATUS CLASS
  // =========================

  const getStatusClass = (status) => {
    switch (status) {

      case "PENDING":
        return "order-status-pending"

      case "CONFIRMED":
        return "order-status-confirmed"

      case "SHIPPED":
        return "order-status-shipped"

      case "DELIVERED":
        return "order-status-delivered"

      case "CANCELLED":
        return "order-status-cancelled"

      default:
        return ""
    }
  }


  // =========================
  // STATUS TEXT
  // =========================

  const getStatusText = (status) => {
    switch (status) {

      case "PENDING":
        return "Pending"

      case "CONFIRMED":
        return "Confirmed"

      case "SHIPPED":
        return "Shipped"

      case "DELIVERED":
        return "Delivered"

      case "CANCELLED":
        return "Cancelled"

      default:
        return status
    }
  }


  // =========================
  // FORMAT DATE
  // =========================

  const formatDate = (date) => {
    if (!date) {
      return "-"
    }

    return new Date(
      date
    ).toLocaleString(
      "en-IN",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    )
  }


  // =========================
  // UI
  // =========================

  return (
    <main className="admin-page">

      <section className="admin-container">


        {/* =========================
            HEADER
        ========================= */}

        <div className="admin-page-header">

          <div>

            <Link
              to="/admin"
              className="admin-back-link"
            >
              ← Admin Dashboard
            </Link>

            <h1>
              Orders
            </h1>

            <p>
              View and manage customer orders.
            </p>

          </div>

        </div>


        {/* =========================
            SUCCESS
        ========================= */}

        {message && (
          <div className="admin-success">
            {message}
          </div>
        )}


        {/* =========================
            ERROR
        ========================= */}

        {error && (
          <div className="admin-error">
            {error}
          </div>
        )}


        {/* =========================
            LOADING
        ========================= */}

        {loading && (
          <p>
            Loading orders...
          </p>
        )}


        {/* =========================
            ORDERS TABLE
        ========================= */}

        {!loading &&
          orders.length > 0 && (

            <div className="admin-table-wrapper">

              <table className="admin-table">

                <thead>

                  <tr>

                    <th>
                      Order
                    </th>

                    <th>
                      Customer
                    </th>

                    <th>
                      Phone
                    </th>

                    <th>
                      Amount
                    </th>

                    <th>
                      Items
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Date
                    </th>

                    <th>
                      Action
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {orders.map(
                    (order) => (

                      <tr
                        key={order.id}
                      >

                        <td>
                          <strong>
                            #{order.id}
                          </strong>
                        </td>


                        <td>
                          {order.full_name}
                        </td>


                        <td>
                          {order.phone}
                        </td>


                        <td>
                          ₹
                          {Number(
                            order.total_amount
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </td>


                        <td>
                          {order.items?.length ||
                            0}
                        </td>


                        <td>

                          <span
                            className={`order-status ${getStatusClass(
                              order.status
                            )}`}
                          >
                            {getStatusText(
                              order.status
                            )}
                          </span>

                        </td>


                        <td>
                          {formatDate(
                            order.created_at
                          )}
                        </td>


                        <td>

                          <button
                            className="admin-edit-button"
                            onClick={() =>
                              openOrder(order)
                            }
                          >
                            View
                          </button>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}


        {/* =========================
            EMPTY
        ========================= */}

        {!loading &&
          orders.length === 0 && (

            <div className="admin-empty">

              <h2>
                No orders found
              </h2>

              <p>
                There are currently no
                customer orders.
              </p>

            </div>

          )}


        {/* =========================
            ORDER DETAILS MODAL
        ========================= */}

        {selectedOrder && (

          <div className="inventory-modal-overlay">

            <div className="admin-order-modal">


              {/* HEADER */}

              <div className="inventory-modal-header">

                <div>

                  <span>
                    Order Details
                  </span>

                  <h2>
                    Order #{selectedOrder.id}
                  </h2>

                </div>


                <button
                  type="button"
                  className="inventory-close-button"
                  onClick={
                    closeOrder
                  }
                >
                  ×
                </button>

              </div>


              {/* CUSTOMER */}

              <div className="admin-order-section">

                <h3>
                  Customer Information
                </h3>

                <div className="admin-order-info-grid">

                  <div>

                    <span>
                      Name
                    </span>

                    <strong>
                      {selectedOrder.full_name}
                    </strong>

                  </div>


                  <div>

                    <span>
                      Phone
                    </span>

                    <strong>
                      {selectedOrder.phone}
                    </strong>

                  </div>


                  <div className="admin-order-info-full">

                    <span>
                      Address
                    </span>

                    <strong>
                      {selectedOrder.address}
                    </strong>

                  </div>


                  <div>

                    <span>
                      City
                    </span>

                    <strong>
                      {selectedOrder.city}
                    </strong>

                  </div>


                  <div>

                    <span>
                      State
                    </span>

                    <strong>
                      {selectedOrder.state}
                    </strong>

                  </div>


                  <div>

                    <span>
                      Pincode
                    </span>

                    <strong>
                      {selectedOrder.pincode}
                    </strong>

                  </div>

                </div>

              </div>


              {/* ITEMS */}

              <div className="admin-order-section">

                <h3>
                  Order Items
                </h3>

                <div className="admin-order-items">

                  {selectedOrder.items?.map(
                    (item) => (

                      <div
                        className="admin-order-item"
                        key={item.id}
                      >

                        <div>

                          <strong>
                            {item.product_name}
                          </strong>

                          <span>
                            Quantity:{" "}
                            {item.quantity}
                          </span>

                        </div>


                        <div>

                          <span>
                            ₹
                            {Number(
                              item.price
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </span>

                          <strong>
                            ₹
                            {Number(
                              item.subtotal
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </strong>

                        </div>

                      </div>

                    )
                  )}

                </div>

              </div>


              {/* STATUS */}

              <div className="admin-order-status-section">

                <div>

                  <span>
                    Current Status
                  </span>

                  <span
                    className={`order-status ${getStatusClass(
                      selectedOrder.status
                    )}`}
                  >
                    {getStatusText(
                      selectedOrder.status
                    )}
                  </span>

                </div>


                {getNextStatus(
                  selectedOrder.status
                ) && (

                  <button
                    className="admin-primary-button"
                    onClick={
                      handleStatusUpdate
                    }
                    disabled={updating}
                  >
                    {updating
                      ? "Updating..."
                      : `Mark as ${getStatusText(
                          getNextStatus(
                            selectedOrder.status
                          )
                        )}`}
                  </button>

                )}

              </div>


              {/* TOTAL */}

              <div className="admin-order-total">

                <span>
                  Total Amount
                </span>

                <strong>
                  ₹
                  {Number(
                    selectedOrder.total_amount
                  ).toLocaleString(
                    "en-IN"
                  )}
                </strong>

              </div>


              {/* DATES */}

              <div className="admin-order-dates">

                <span>
                  Created:{" "}
                  {formatDate(
                    selectedOrder.created_at
                  )}
                </span>

                <span>
                  Updated:{" "}
                  {formatDate(
                    selectedOrder.updated_at
                  )}
                </span>

              </div>

            </div>

          </div>

        )}

      </section>

    </main>
  )
}

export default AdminOrders