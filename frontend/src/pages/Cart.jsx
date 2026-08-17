import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import api from "../services/api"

function Cart() {
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [updatingItem, setUpdatingItem] = useState(null)

  const fetchCart = async () => {
    try {
      setLoading(true)
      setError("")

      const response = await api.get("/cart/")

      setCart(response.data)
    } catch (error) {
      console.error("Failed to fetch cart:", error)

      if (error.response?.data?.detail) {
        setError(error.response.data.detail)
      } else {
        setError("Unable to load your cart.")
      }
    } finally {
      setLoading(false)
    }
  }


  useEffect(() => {
    fetchCart()
  }, [])


  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      return
    }

    try {
      setUpdatingItem(itemId)
      setError("")

      const response = await api.patch(
        `/cart/items/${itemId}/`,
        {
          quantity: newQuantity,
        }
      )

      setCart((previousCart) => ({
        ...previousCart,
        items: previousCart.items.map((item) =>
          item.id === itemId
            ? response.data
            : item
        ),
      }))

    } catch (error) {
      console.error(
        "Failed to update quantity:",
        error
      )

      if (error.response?.data?.detail) {
        setError(error.response.data.detail)
      } else {
        setError(
          "Unable to update product quantity."
        )
      }
    } finally {
      setUpdatingItem(null)
    }
  }


  const removeItem = async (itemId) => {
    try {
      setUpdatingItem(itemId)
      setError("")

      await api.delete(
        `/cart/items/${itemId}/delete/`
      )

      setCart((previousCart) => ({
        ...previousCart,
        items: previousCart.items.filter(
          (item) => item.id !== itemId
        ),
      }))

    } catch (error) {
      console.error(
        "Failed to remove item:",
        error
      )

      setError(
        "Unable to remove the item."
      )
    } finally {
      setUpdatingItem(null)
    }
  }


  const clearCart = async () => {
    try {
      setError("")

      await api.delete("/cart/clear/")

      setCart((previousCart) => ({
        ...previousCart,
        items: [],
      }))

    } catch (error) {
      console.error(
        "Failed to clear cart:",
        error
      )

      setError(
        "Unable to clear the cart."
      )
    }
  }


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


  if (loading) {
    return (
      <main className="cart-page">
        <div className="cart-container">
          <p>Loading your cart...</p>
        </div>
      </main>
    )
  }


  if (error && !cart) {
    return (
      <main className="cart-page">
        <div className="cart-container">

          <div className="cart-error">
            {error}
          </div>

          <button
            className="retry-button"
            onClick={fetchCart}
          >
            Try Again
          </button>

        </div>
      </main>
    )
  }


  const items = cart?.items || []
  const subtotal = calculateSubtotal()


  if (items.length === 0) {
    return (
      <main className="cart-page">
        <div className="cart-container">

          <div className="cart-heading">
            <h1>My Cart</h1>

            <p>
              Review the products you want to buy.
            </p>
          </div>


          <div className="empty-cart">

            <div className="empty-cart-icon">
              🛒
            </div>

            <h2>
              Your cart is empty
            </h2>

            <p>
              Discover something you'll love.
            </p>

            <Link
              to="/products"
              className="continue-shopping-button"
            >
              Continue Shopping
            </Link>

          </div>

        </div>
      </main>
    )
  }


  return (
    <main className="cart-page">

      <div className="cart-container">

        {/* Heading */}

        <div className="cart-heading">
          <h1>My Cart</h1>

          <p>
            Review and manage your selected products.
          </p>
        </div>


        {/* Error */}

        {error && (
          <div className="cart-error">
            {error}
          </div>
        )}


        <div className="cart-layout">

          {/* Cart Items */}

          <section className="cart-items">

            {items.map((item) => {

              const product =
                item.product_details

              const itemTotal =
                Number(product.price) *
                item.quantity

              const isUpdating =
                updatingItem === item.id

              return (
                <article
                  className="cart-item"
                  key={item.id}
                >

                  {/* Product Image */}

                  <div className="cart-product-image">
                    <span>
                      No Image
                    </span>
                  </div>


                  {/* Product Information */}

                  <div className="cart-product-info">

                    <p className="cart-product-category">
                      {product.category_name}
                    </p>

                    <h2>
                      {product.name}
                    </h2>

                    <p className="cart-product-price">
                      ₹
                      {Number(
                        product.price
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </p>

                    {product.stock === 0 && (
                    <p className="cart-product-stock stock-unavailable">
                        Out of stock
                    </p>
                    )}

                    {product.stock > 0 && product.stock <= 5 && (
                    <p className="cart-product-stock stock-low">
                        Only {product.stock} left
                    </p>
                    )}

                  </div>


                  {/* Quantity */}

                  <div className="cart-quantity-section">

                    <span>
                      Quantity
                    </span>

                    <div className="quantity-controls">

                      <button
                        type="button"
                        disabled={
                          isUpdating ||
                          item.quantity <= 1
                        }
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            item.quantity - 1
                          )
                        }
                      >
                        −
                      </button>

                      <span>
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        disabled={
                          isUpdating ||
                          item.quantity >=
                            product.stock
                        }
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            item.quantity + 1
                          )
                        }
                      >
                        +
                      </button>

                    </div>

                  </div>


                  {/* Item Total */}

                  <div className="cart-item-total">

                    <strong>
                      ₹
                      {itemTotal.toLocaleString(
                        "en-IN"
                      )}
                    </strong>

                    <button
                      type="button"
                      className="remove-item-button"
                      disabled={isUpdating}
                      onClick={() =>
                        removeItem(item.id)
                      }
                    >
                      Remove
                    </button>

                  </div>

                </article>
              )
            })}


            {/* Clear Cart */}

            <button
              type="button"
              className="clear-cart-button"
              onClick={clearCart}
            >
              Clear Cart
            </button>

          </section>


          {/* Cart Summary */}

          <aside className="cart-summary">

            <h2>
              Cart Summary
            </h2>

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


            <div className="summary-row">

              <span>
                Shipping
              </span>

              <span>
                Free
              </span>

            </div>


            <div className="summary-divider"></div>


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


            <button
              type="button"
              className="checkout-button"
              disabled
            >
              Proceed to Checkout
            </button>


            <Link
              to="/products"
              className="continue-shopping-link"
            >
              Continue Shopping
            </Link>

          </aside>

        </div>

      </div>

    </main>
  )
}

export default Cart