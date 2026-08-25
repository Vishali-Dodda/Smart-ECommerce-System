import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useCart } from "../context/CartContext"

function Cart() {

  const navigate = useNavigate()

  const {
    cart,
    loading,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart()

  const [error, setError] = useState("")
  const [updatingItem, setUpdatingItem] = useState(null)


  // =========================
  // UPDATE QUANTITY
  // =========================

  const handleUpdateQuantity = async (
    itemId,
    newQuantity
  ) => {

    if (newQuantity < 1) {
      return
    }

    try {

      setUpdatingItem(itemId)
      setError("")

      await updateQuantity(
        itemId,
        newQuantity
      )

    } catch (error) {

      console.error(
        "Failed to update quantity:",
        error
      )

      if (error.response?.data?.detail) {

        setError(
          error.response.data.detail
        )

      } else {

        setError(
          "Unable to update product quantity."
        )
      }

    } finally {

      setUpdatingItem(null)

    }
  }


  // =========================
  // REMOVE ITEM
  // =========================

  const handleRemoveItem = async (
    itemId
  ) => {

    try {

      setUpdatingItem(itemId)
      setError("")

      await removeItem(itemId)

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


  // =========================
  // CLEAR CART
  // =========================

  const handleClearCart = async () => {

    try {

      setError("")

      await clearCart()

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
  // LOADING
  // =========================

  if (loading && !cart) {

    return (

      <main className="cart-page">

        <div className="cart-container">

          <p>
            Loading your cart...
          </p>

        </div>

      </main>
    )
  }


  // =========================
  // CART ERROR
  // =========================

  if (!cart) {

    return (

      <main className="cart-page">

        <div className="cart-container">

          <div className="cart-error">

            {error ||
              "Unable to load your cart."}

          </div>

        </div>

      </main>
    )
  }


  const items = cart.items || []

  const subtotal =
    calculateSubtotal()


  // =========================
  // EMPTY CART
  // =========================

  if (items.length === 0) {

    return (

      <main className="cart-page">

        <div className="cart-container">

          <div className="cart-heading">

            <h1>
              My Cart
            </h1>

            <p>
              Discover something you'll love.
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


  // =========================
  // CART PAGE
  // =========================

  return (

    <main className="cart-page">

      <div className="cart-container">


        {/* =========================
            HEADING
        ========================= */}

        <div className="cart-heading">

          <h1>
            My Cart
          </h1>

          <p>
            Review and manage your selected products.
          </p>

        </div>


        {/* =========================
            ERROR
        ========================= */}

        {error && (

          <div className="cart-error">

            {error}

          </div>

        )}


        <div className="cart-layout">


          {/* =========================
              CART ITEMS
          ========================= */}

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


                  {/* =========================
                      PRODUCT IMAGE
                  ========================= */}

                  <div className="cart-product-image">

                    {product.image_url ? (

                      <img
                        src={
                          `http://localhost:5173${product.image_url}`
                        }
                        alt={product.name}
                        className="cart-product-image-img"
                      />

                    ) : (

                      <span>
                        No Image
                      </span>

                    )}

                  </div>


                  {/* =========================
                      PRODUCT INFORMATION
                  ========================= */}

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


                    {/* LOW STOCK */}

                    {product.stock === 0 && (

                      <p className="cart-product-stock stock-unavailable">

                        Out of stock

                      </p>

                    )}


                    {product.stock > 0 &&
                      product.stock <= 5 && (

                      <p className="cart-product-stock stock-low">

                        Only {product.stock} left

                      </p>

                    )}

                  </div>


                  {/* =========================
                      QUANTITY
                  ========================= */}

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
                          handleUpdateQuantity(
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
                          product.stock === 0 ||
                          item.quantity >=
                            product.stock
                        }
                        onClick={() =>
                          handleUpdateQuantity(
                            item.id,
                            item.quantity + 1
                          )
                        }
                      >
                        +
                      </button>

                    </div>

                  </div>


                  {/* =========================
                      ITEM TOTAL
                  ========================= */}

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
                        handleRemoveItem(
                          item.id
                        )
                      }
                    >
                      Remove
                    </button>

                  </div>

                </article>

              )

            })}


            {/* =========================
                CLEAR CART
            ========================= */}

            <button
              type="button"
              className="clear-cart-button"
              onClick={
                handleClearCart
              }
            >
              Clear Cart
            </button>

          </section>


          {/* =========================
              CART SUMMARY
          ========================= */}

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


            <div className="summary-divider">
            </div>


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


            {/* =========================
                CHECKOUT
            ========================= */}

            <button
              type="button"
              className="checkout-button"
              onClick={() =>
                navigate("/checkout")
              }
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