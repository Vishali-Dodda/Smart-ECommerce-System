import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import api from "../services/api"

function AdminInventory() {
  const [inventory, setInventory] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  const [adjustingProduct, setAdjustingProduct] =
    useState(null)

  const [quantity, setQuantity] = useState("")
  const [reason, setReason] = useState("")


  // =========================
  // FETCH ALL INVENTORY
  // =========================

  const fetchInventory = async () => {
    try {
      setLoading(true)
      setError("")

      let allInventory = []
      let url = "/inventory/"

      // Inventory API is paginated.
      // Keep requesting pages until there
      // is no next page.

      while (url) {
        const response = await api.get(url)

        const results =
          response.data.results ||
          response.data

        allInventory = [
          ...allInventory,
          ...results,
        ]

        url = response.data.next
      }

      setInventory(allInventory)

    } catch (error) {
      console.error(
        "Failed to fetch inventory:",
        error
      )

      setError(
        error.response?.data?.detail ||
        "Unable to load inventory."
      )

    } finally {
      setLoading(false)
    }
  }


  // =========================
  // INITIAL LOAD
  // =========================

  useEffect(() => {
    fetchInventory()
  }, [])


  // =========================
  // OPEN ADJUSTMENT
  // =========================

  const openAdjustment = (product) => {
    setAdjustingProduct(product)

    setQuantity("")
    setReason("")
    setMessage("")
    setError("")
  }


  // =========================
  // CLOSE ADJUSTMENT
  // =========================

  const closeAdjustment = () => {
    setAdjustingProduct(null)

    setQuantity("")
    setReason("")
  }


  // =========================
  // ADJUST STOCK
  // =========================

  const handleAdjustment = async (event) => {
    event.preventDefault()

    if (
      !quantity ||
      Number(quantity) === 0
    ) {
      setError(
        "Enter a non-zero stock adjustment."
      )

      return
    }

    if (!reason.trim()) {
      setError(
        "Please provide a reason."
      )

      return
    }

    try {
      setError("")
      setMessage("")

      await api.post(
        `/inventory/${adjustingProduct.id}/adjust/`,
        {
          quantity: Number(quantity),
          reason: reason.trim(),
        }
      )

      setMessage(
        "Stock updated successfully."
      )

      closeAdjustment()

      await fetchInventory()

    } catch (error) {
      console.error(
        "Failed to adjust stock:",
        error
      )

      setError(
        error.response?.data?.detail ||
        "Unable to update stock."
      )
    }
  }


  // =========================
  // STOCK STATUS CLASS
  // =========================

  const getStatusClass = (status) => {
    if (status === "OUT_OF_STOCK") {
      return "inventory-status-out"
    }

    if (status === "LOW_STOCK") {
      return "inventory-status-low"
    }

    return "inventory-status-in"
  }


  // =========================
  // STOCK STATUS TEXT
  // =========================

  const getStatusText = (status) => {
    if (status === "OUT_OF_STOCK") {
      return "Out of Stock"
    }

    if (status === "LOW_STOCK") {
      return "Low Stock"
    }

    return "In Stock"
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
              Inventory
            </h1>

            <p>
              Monitor and manage product stock.
            </p>

          </div>

        </div>


        {/* =========================
            SUCCESS MESSAGE
        ========================= */}

        {message && (
          <div className="admin-success">
            {message}
          </div>
        )}


        {/* =========================
            ERROR MESSAGE
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
            Loading inventory...
          </p>
        )}


        {/* =========================
            INVENTORY TABLE
        ========================= */}

        {!loading &&
          !error &&
          inventory.length > 0 && (

            <div className="inventory-table-wrapper">

              <table className="inventory-table">

                <thead>

                  <tr>

                    <th>
                      Product
                    </th>

                    <th>
                      ID
                    </th>

                    <th>
                      Category
                    </th>

                    <th>
                      Price
                    </th>

                    <th>
                      Stock
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Action
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {inventory.map(
                    (product) => (

                      <tr key={product.id}>


                        {/* PRODUCT */}

                        <td>

                          <strong>
                            {product.product_name}
                          </strong>

                        </td>


                        {/* PRODUCT ID */}

                        <td>

                          #{product.id}

                        </td>


                        {/* CATEGORY */}

                        <td>

                          {product.category_name}

                        </td>


                        {/* PRICE */}

                        <td>

                          ₹
                          {Number(
                            product.price
                          ).toLocaleString(
                            "en-IN"
                          )}

                        </td>


                        {/* STOCK */}

                        <td>

                          {product.stock}

                        </td>


                        {/* STATUS */}

                        <td>

                          <span
                            className={`inventory-status ${getStatusClass(
                              product.stock_status
                            )}`}
                          >

                            {getStatusText(
                              product.stock_status
                            )}

                          </span>

                        </td>


                        {/* ACTION */}

                        <td>

                          <button
                            className="inventory-adjust-button"
                            onClick={() =>
                              openAdjustment(
                                product
                              )
                            }
                          >
                            Adjust Stock
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
            EMPTY STATE
        ========================= */}

        {!loading &&
          !error &&
          inventory.length === 0 && (

            <div className="admin-empty">

              <h2>
                No inventory found
              </h2>

              <p>
                There are currently no
                products in the inventory.
              </p>

            </div>

          )}


        {/* =========================
            STOCK ADJUSTMENT MODAL
        ========================= */}

        {adjustingProduct && (

          <div className="inventory-modal-overlay">

            <div className="inventory-modal">


              {/* MODAL HEADER */}

              <div className="inventory-modal-header">

                <div>

                  <span>
                    Adjust Stock
                  </span>

                  <h2>
                    {adjustingProduct.product_name}
                  </h2>

                  <small>
                    Product #{adjustingProduct.id}
                  </small>

                </div>


                <button
                  type="button"
                  className="inventory-close-button"
                  onClick={
                    closeAdjustment
                  }
                >
                  ×
                </button>

              </div>


              {/* CURRENT STOCK */}

              <div className="inventory-current-stock">

                <span>
                  Current stock
                </span>

                <strong>
                  {adjustingProduct.stock}
                </strong>

              </div>


              {/* FORM */}

              <form
                onSubmit={
                  handleAdjustment
                }
              >


                {/* QUANTITY */}

                <label>
                  Adjustment Quantity
                </label>

                <input
                  type="number"
                  value={quantity}
                  onChange={(event) =>
                    setQuantity(
                      event.target.value
                    )
                  }
                  placeholder="Example: 10 or -5"
                />

                <p className="inventory-help-text">
                  Use a positive number to add
                  stock and a negative number
                  to remove stock.
                </p>


                {/* REASON */}

                <label>
                  Reason
                </label>

                <input
                  type="text"
                  value={reason}
                  onChange={(event) =>
                    setReason(
                      event.target.value
                    )
                  }
                  placeholder="Example: New stock received"
                />


                {/* ACTIONS */}

                <div className="inventory-modal-actions">

                  <button
                    type="button"
                    className="inventory-cancel-button"
                    onClick={
                      closeAdjustment
                    }
                  >
                    Cancel
                  </button>


                  <button
                    type="submit"
                    className="inventory-save-button"
                  >
                    Update Stock
                  </button>

                </div>

              </form>

            </div>

          </div>

        )}

      </section>

    </main>
  )
}

export default AdminInventory