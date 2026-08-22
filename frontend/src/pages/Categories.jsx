import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import api from "../services/api"

function Categories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")


  // =========================
  // FETCH CATEGORIES
  // =========================

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        setError("")

        const response = await api.get(
          "/categories/"
        )

        setCategories(
          response.data.results ||
          response.data
        )

      } catch (error) {
        console.error(
          "Failed to fetch categories:",
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
            "Unable to load categories."
          )
        }

      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])


  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <main className="categories-page">

        <div className="categories-container">

          <p>
            Loading categories...
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
      <main className="categories-page">

        <div className="categories-container">

          <div className="categories-error">

            <h1>
              Unable to load categories
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
  // EMPTY
  // =========================

  if (categories.length === 0) {
    return (
      <main className="categories-page">

        <div className="categories-container">

          <div className="categories-heading">

            <h1>
              Categories
            </h1>

            <p>
              Browse products by category.
            </p>

          </div>


          <div className="categories-empty">

            <h2>
              No categories available
            </h2>

            <p>
              There are currently no product
              categories to display.
            </p>

            <Link
              to="/products"
              className="categories-button"
            >
              Browse Products
            </Link>

          </div>

        </div>

      </main>
    )
  }


  // =========================
  // CATEGORIES PAGE
  // =========================

  return (
    <main className="categories-page">

      <div className="categories-container">

        {/* Heading */}

        <div className="categories-heading">

          <h1>
            Categories
          </h1>

          <p>
            Explore our products by category.
          </p>

        </div>


        {/* Category Grid */}

        <div className="categories-grid">

          {categories.map((category) => (

            <article
              className="category-card"
              key={category.id}
            >

              <div className="category-icon">
                {category.name
                  ?.charAt(0)
                  ?.toUpperCase()}
              </div>


              <div className="category-content">

                <h2>
                  {category.name}
                </h2>

                <p>
                  Explore products in{" "}
                  {category.name}.
                </p>

                <Link
                  to={`/products?category=${category.id}`}
                  className="category-button"
                >
                  View Products
                </Link>

              </div>

            </article>

          ))}

        </div>

      </div>

    </main>
  )
}

export default Categories