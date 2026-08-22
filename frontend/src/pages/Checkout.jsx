import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useCart } from "../context/CartContext"
import api from "../services/api"

function Checkout() {
  const navigate = useNavigate()

  const {
    cart,
    loading,
    fetchCart,
  } = useCart()

  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  })

  const [error, setError] = useState("")
  const [placingOrder, setPlacingOrder] = useState(false)


  // =========================
  // HANDLE INPUT
  // =========================

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))
  }


  // =========================
  // CALCULATE SUBTOTAL
  // =========================

  const calculateSubtotal = () => {
    if (!cart?.items) {
      return 0
    }

    return cart.items.reduce(
      (total, item) => {
        const price = Number(
          item.product_details.price
        )

        return (
          total +
          price * item.quantity
        )
      },
      0
    )
  }


  // =========================
  // PLACE ORDER
  // =========================

  const handlePlaceOrder = async (
    event
  ) => {
    event.preventDefault()

    setError("")

    // Basic validation

    if (
      !formData.full_name.trim() ||
      !formData.phone.trim() ||
      !formData.address.trim() ||
      !formData.city.trim() ||
      !formData.state.trim() ||
      !formData.pincode.trim()
    ) {
      setError(
        "Please fill in all delivery details."
      )

      return
    }


    if (!/^\d{10}$/.test(formData.phone)) {
      setError(
        "Please enter a valid 10-digit phone number."
      )

      return
    }


    if (!/^\d{6}$/.test(formData.pincode)) {
      setError(
        "Please enter a valid 6-digit pincode."
      )

      return
    }


    if (
      !cart?.items ||
      cart.items.length === 0
    ) {
      setError(
        "Your cart is empty."
      )

      return
    }


    try {
      setPlacingOrder(true)


      const response = await api.post(
        "/orders/create/",
        formData
      )


      // Refresh cart state after
      // successful order creation.

      await fetchCart()


      // Send user to order
      // confirmation page.

      navigate(
        `/orders/${response.data.id}`,
        {
          state: {
            order: response.data,
            justPlaced: true,
          },
        }
      )

    } catch (error) {
      console.error(
        "Failed to place order:",
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
          "Unable to place your order. Please try again."
        )
      }

    } finally {
      setPlacingOrder(false)
    }
  }


  // =========================
  // LOADING
  // =========================

  if (loading && !cart) {
    return (
      <main className="checkout-page">

        <div className="checkout-container">

          <p>
            Loading checkout...
          </p>

        </div>

      </main>
    )
  }


  // =========================
  // EMPTY CART
  // =========================

  if (
    cart &&
    (!cart.items ||
      cart.items.length === 0)
  ) {
    return (
      <main className="checkout-page">

        <div className="checkout-container">

          <div className="checkout-empty">

            <h1>
              Your cart is empty
            </h1>

            <p>
              Add products to your cart
              before proceeding to checkout.
            </p>

            <button
              type="button"
              className="continue-shopping-button"
              onClick={() =>
                navigate("/products")
              }
            >
              Continue Shopping
            </button>

          </div>

        </div>

      </main>
    )
  }


  const subtotal =
    calculateSubtotal()


  // =========================
  // CHECKOUT UI
  // =========================

  return (
    <main className="checkout-page">

      <div className="checkout-container">

        {/* =========================
            HEADING
        ========================= */}

        <div className="checkout-heading">

          <h1>
            Checkout
          </h1>

          <p>
            Enter your delivery details
            to place your order.
          </p>

        </div>


        {/* =========================
            ERROR
        ========================= */}

        {error && (
          <div className="checkout-error">
            {error}
          </div>
        )}


        <div className="checkout-layout">

          {/* =========================
              DELIVERY FORM
          ========================= */}

          <form
            className="checkout-form"
            onSubmit={handlePlaceOrder}
          >

            <section className="checkout-section">

              <h2>
                Delivery Information
              </h2>


              {/* Full Name */}

              <div className="checkout-field">

                <label htmlFor="full_name">
                  Full Name
                </label>

                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.full_name}
                  onChange={handleChange}
                  disabled={placingOrder}
                />

              </div>


              {/* Phone */}

              <div className="checkout-field">

                <label htmlFor="phone">
                  Phone Number
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Enter 10-digit phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={placingOrder}
                  maxLength="10"
                />

              </div>


              {/* Address */}

              <div className="checkout-field">

                <label htmlFor="address">
                  Address
                </label>

                <textarea
                  id="address"
                  name="address"
                  placeholder="Enter your complete address"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={placingOrder}
                  rows="4"
                />

              </div>


              {/* City + State */}

              <div className="checkout-row">

                <div className="checkout-field">

                  <label htmlFor="city">
                    City
                  </label>

                  <input
                    id="city"
                    name="city"
                    type="text"
                    placeholder="City"
                    value={formData.city}
                    onChange={handleChange}
                    disabled={placingOrder}
                  />

                </div>


                <div className="checkout-field">

                  <label htmlFor="state">
                    State
                  </label>

                  <input
                    id="state"
                    name="state"
                    type="text"
                    placeholder="State"
                    value={formData.state}
                    onChange={handleChange}
                    disabled={placingOrder}
                  />

                </div>

              </div>


              {/* Pincode */}

              <div className="checkout-field">

                <label htmlFor="pincode">
                  Pincode
                </label>

                <input
                  id="pincode"
                  name="pincode"
                  type="text"
                  placeholder="6-digit pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  disabled={placingOrder}
                  maxLength="6"
                />

              </div>

            </section>


            {/* =========================
                PAYMENT
            ========================= */}

            <section className="checkout-section">

              <h2>
                Payment Method
              </h2>

              <div className="payment-option">

                <input
                  type="radio"
                  id="cod"
                  name="payment"
                  checked
                  readOnly
                />

                <label htmlFor="cod">
                  <strong>
                    Cash on Delivery
                  </strong>

                  <span>
                    Pay when your order arrives.
                  </span>
                </label>

              </div>

            </section>


            {/* =========================
                PLACE ORDER
            ========================= */}

            <button
              type="submit"
              className="place-order-button"
              disabled={placingOrder}
            >
              {placingOrder
                ? "Placing Order..."
                : "Place Order"}
            </button>

          </form>


          {/* =========================
              ORDER SUMMARY
          ========================= */}

          <aside className="checkout-summary">

            <h2>
              Order Summary
            </h2>


            {/* Items */}

            <div className="checkout-summary-items">

              {cart.items.map(
                (item) => {

                  const product =
                    item.product_details

                  const itemTotal =
                    Number(
                      product.price
                    ) *
                    item.quantity


                  return (
                    <div
                      className="checkout-summary-item"
                      key={item.id}
                    >

                      <div>

                        <strong>
                          {product.name}
                        </strong>

                        <span>
                          Qty: {item.quantity}
                        </span>

                      </div>


                      <span>
                        ₹
                        {itemTotal.toLocaleString(
                          "en-IN"
                        )}
                      </span>

                    </div>
                  )
                }
              )}

            </div>


            <div className="summary-divider"></div>


            {/* Subtotal */}

            <div className="summary-row">

              <span>
                Subtotal
              </span>

              <span>
                ₹
                {subtotal.toLocaleString(
                  "en-IN"
                )}
              </span>

            </div>


            {/* Shipping */}

            <div className="summary-row">

              <span>
                Shipping
              </span>

              <span>
                Free
              </span>

            </div>


            <div className="summary-divider"></div>


            {/* Total */}

            <div className="summary-total">

              <span>
                Total
              </span>

              <strong>
                ₹
                {subtotal.toLocaleString(
                  "en-IN"
                )}
              </strong>

            </div>

          </aside>

        </div>

      </div>

    </main>
  )
}

export default Checkout