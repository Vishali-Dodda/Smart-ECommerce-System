import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import api from "../services/api"

function Home() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/categories/")

        setCategories(response.data.results)

      } catch (error) {
        console.error(
          "Failed to fetch categories:",
          error
        )

        setError(
          "Unable to load categories."
        )

      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  return (
    <main>

      {/* =========================
          HERO
      ========================= */}

      <section className="hero">

        <div className="hero-content">

          <h1>
            Everything you need,
            <br />
            <span>
              all in one place.
            </span>
          </h1>

          <p>
            Discover quality products across
            electronics, fashion, home, fitness,
            gaming and more.
          </p>

          <Link
            to="/products"
            className="hero-button"
          >
            Explore Products
          </Link>

        </div>

      </section>


      {/* =========================
          SHOP BY CATEGORY
      ========================= */}

      <section className="home-section">

        <div className="section-heading">

          <h2>
            Shop by Category
          </h2>

          <p>
            Explore products across different
            categories.
          </p>

        </div>


        {loading && (
          <p>
            Loading categories...
          </p>
        )}


        {error && (
          <p>
            {error}
          </p>
        )}


        {!loading &&
          !error && (

            <div className="category-grid">

              {categories.map(
                (category) => (

                  <Link
                    key={category.id}
                    to={`/products?category=${category.id}`}
                    className="category-card"
                  >
                    {category.name}
                  </Link>

                )
              )}

            </div>

          )}

      </section>


      {/* =========================
          WHY SHOPFUSION
      ========================= */}

      <section className="home-section">

        <div className="section-heading">

          <h2>
            Why ShopFusion?
          </h2>

          <p>
            A simple and reliable shopping
            experience.
          </p>

        </div>


        <div className="benefits-grid">

          <div className="benefit-card">

            <h3>
              Wide Selection
            </h3>

            <p>
              Discover products across multiple
              categories in one convenient place.
            </p>

          </div>


          <div className="benefit-card">

            <h3>
              Secure Shopping
            </h3>

            <p>
              Your account and shopping experience
              are protected with secure authentication.
            </p>

          </div>


          <div className="benefit-card">

            <h3>
              Easy Ordering
            </h3>

            <p>
              Add products to your cart and manage
              your orders with ease.
            </p>

          </div>

        </div>

      </section>

    </main>
  )
}

export default Home