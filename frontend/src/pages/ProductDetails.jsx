import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"

import api from "../services/api"
import { useAuth } from "../context/AuthContext"
import { useCart } from "../context/CartContext"

function ProductDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { isAuthenticated } = useAuth()
  const { addToCart } = useCart()

  const [product, setProduct] = useState(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [addingToCart, setAddingToCart] = useState(false)
  const [cartMessage, setCartMessage] = useState("")


  // =========================
  // FETCH PRODUCT
  // =========================

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true)
      setError("")

      try {
        const response = await api.get(
          `/products/${id}/`
        )

        setProduct(response.data)

      } catch (error) {
        console.error(
          "Failed to fetch product:",
          error
        )

        setError(
          "Unable to load product."
        )

      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])


  // =========================
  // ADD TO CART
  // =========================

  const handleAddToCart = async () => {

    // User must be logged in
    if (!isAuthenticated) {
      navigate("/login", {
        state: {
          from: `/products/${id}`,
        },
      })

      return
    }


    try {
      setAddingToCart(true)
      setCartMessage("")

      await addToCart(product.id, 1)

      setCartMessage(
        "Product added to your cart."
      )

    } catch (error) {

      console.error(
        "Failed to add product to cart:",
        error
      )

      if (error.response?.data?.detail) {
        setCartMessage(
          error.response.data.detail
        )
      } else {
        setCartMessage(
          "Unable to add product to cart."
        )
      }

    } finally {
      setAddingToCart(false)
    }
  }


  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <main>
        <p>Loading product...</p>
      </main>
    )
  }


  // =========================
  // ERROR
  // =========================

  if (error) {
    return (
      <main>
        <p>{error}</p>

        <Link to="/products">
          Back to Products
        </Link>
      </main>
    )
  }


  // =========================
  // PRODUCT NOT FOUND
  // =========================

  if (!product) {
    return (
      <main>
        <p>
          Product not found.
        </p>

        <Link to="/products">
          Back to Products
        </Link>
      </main>
    )
  }


  // =========================
  // PAGE
  // =========================

  return (
    <main>

      <section className="product-details">

        <Link
          to="/products"
          className="back-link"
        >
          ← Back to Products
        </Link>


        <div className="product-details-card">

          {/* PRODUCT IMAGE */}

          <div className="product-details-image">
            <span>
              No Image
            </span>
          </div>


          {/* PRODUCT INFORMATION */}

          <div className="product-details-info">

            <p className="product-category">
              {product.category_name}
            </p>


            <h1>
              {product.name}
            </h1>


            <p className="product-details-price">
              ₹
              {Number(
                product.price
              ).toLocaleString(
                "en-IN"
              )}
            </p>


            <p className="product-details-description">
              {product.description}
            </p>


            {/* STOCK */}

            <div className="product-details-stock">

              {product.stock > 0 ? (

                <span className="stock-available">
                  In Stock
                </span>

              ) : (

                <span className="stock-unavailable">
                  Out of Stock
                </span>

              )}

            </div>


            {/* ADD TO CART */}

            <button
              className="add-cart-button details-cart-button"
              disabled={
                product.stock === 0 ||
                addingToCart
              }
              onClick={handleAddToCart}
            >
              {addingToCart
                ? "Adding..."
                : "Add to Cart"}
            </button>


            {/* CART MESSAGE */}

            {cartMessage && (
              <div className="cart-action-message">
                {cartMessage}
              </div>
            )}

          </div>

        </div>

      </section>

    </main>
  )
}


export default ProductDetails