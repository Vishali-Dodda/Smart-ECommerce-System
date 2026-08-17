import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import api from "../services/api"

function ProductDetails() {
  const { id } = useParams()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true)
      setError("")

      try {
        const response = await api.get(`/products/${id}/`)
        setProduct(response.data)
      } catch (error) {
        console.error("Failed to fetch product:", error)
        setError("Unable to load product.")
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  if (loading) {
    return (
      <main>
        <p>Loading product...</p>
      </main>
    )
  }

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

  if (!product) {
    return (
      <main>
        <p>Product not found.</p>

        <Link to="/products">
          Back to Products
        </Link>
      </main>
    )
  }

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

          <div className="product-details-image">
            <span>No Image</span>
          </div>

          <div className="product-details-info">

            <p className="product-category">
              {product.category_name}
            </p>

            <h1>{product.name}</h1>

            <p className="product-details-price">
              ₹
              {Number(
                product.price
              ).toLocaleString("en-IN")}
            </p>

            <p className="product-details-description">
              {product.description}
            </p>

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

            <button
              className="add-cart-button details-cart-button"
              disabled={product.stock === 0}
            >
              Add to Cart
            </button>

          </div>

        </div>

      </section>
    </main>
  )
}

export default ProductDetails