import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import api from "../services/api"
import { useAuth } from "../context/AuthContext"

function Products() {
  // =========================
  // AUTHENTICATION
  // =========================

  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()


  // =========================
  // STATE
  // =========================

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Cart button state
  const [addingToCart, setAddingToCart] = useState(null)
  const [addedToCart, setAddedToCart] = useState([])

  // Filters
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [ordering, setOrdering] = useState("")

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  const [nextPage, setNextPage] = useState(null)
  const [previousPage, setPreviousPage] = useState(null)


  // =========================
  // FETCH CATEGORIES
  // =========================

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
      }
    }

    fetchCategories()
  }, [])


  // =========================
  // RESET PAGE WHEN FILTERS CHANGE
  // =========================

  useEffect(() => {
    setCurrentPage(1)
  }, [
    search,
    category,
    minPrice,
    maxPrice,
    ordering,
  ])


  // =========================
  // FETCH PRODUCTS
  // =========================

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      setError("")

      try {
        const params = {
          page: currentPage,
        }

        // Search
        if (search.trim()) {
          params.search = search.trim()
        }

        // Category
        if (category) {
          params.category = category
        }

        // Minimum price
        if (minPrice) {
          params.min_price = minPrice
        }

        // Maximum price
        if (maxPrice) {
          params.max_price = maxPrice
        }

        // Sorting
        if (ordering) {
          params.ordering = ordering
        }

        const response = await api.get(
          "/products/",
          {
            params,
          }
        )

        // Products
        setProducts(response.data.results)

        // Pagination information
        setTotalProducts(response.data.count)
        setNextPage(response.data.next)
        setPreviousPage(response.data.previous)

      } catch (error) {
        console.error(
          "Failed to fetch products:",
          error
        )

        setError("Unable to load products.")

      } finally {
        setLoading(false)
      }
    }

    fetchProducts()

  }, [
    search,
    category,
    minPrice,
    maxPrice,
    ordering,
    currentPage,
  ])


  // =========================
  // ADD TO CART
  // =========================

  const handleAddToCart = async (product) => {

    // User must be logged in
    if (!isAuthenticated) {
      navigate("/login", {
        state: {
          from: "/products",
        },
      })

      return
    }


    try {
      setAddingToCart(product.id)

      await api.post(
        "/cart/items/",
        {
          product: product.id,
          quantity: 1,
        }
      )


      // Mark product as added
      setAddedToCart((previous) => [
        ...previous,
        product.id,
      ])


      // Return button to normal after a short delay
      setTimeout(() => {
        setAddedToCart((previous) =>
          previous.filter(
            (id) => id !== product.id
          )
        )
      }, 2000)


    } catch (error) {

      console.error(
        "Failed to add product to cart:",
        error
      )

      if (error.response?.data?.detail) {
        alert(
          error.response.data.detail
        )
      } else {
        alert(
          "Unable to add product to cart."
        )
      }

    } finally {
      setAddingToCart(null)
    }
  }


  // =========================
  // NEXT PAGE
  // =========================

  const handleNextPage = () => {
    if (nextPage) {
      setCurrentPage(
        (page) => page + 1
      )
    }
  }


  // =========================
  // PREVIOUS PAGE
  // =========================

  const handlePreviousPage = () => {
    if (previousPage) {
      setCurrentPage(
        (page) => page - 1
      )
    }
  }


  // =========================
  // UI
  // =========================

  return (
    <main>
      <section className="products-page">

        {/* PAGE HEADING */}

        <div className="section-heading">
          <h1>All Products</h1>

          <p>
            Explore our collection of products
            across different categories.
          </p>
        </div>


        {/* FILTERS */}

        <div className="product-filters">

          {/* Search */}

          <input
            type="text"
            placeholder="Search products..."
            className="search-input"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />


          {/* Category */}

          <select
            className="filter-select"
            value={category}
            onChange={(event) =>
              setCategory(event.target.value)
            }
          >
            <option value="">
              All Categories
            </option>

            {categories.map((item) => (
              <option
                key={item.id}
                value={item.id}
              >
                {item.name}
              </option>
            ))}
          </select>


          {/* Minimum Price */}

          <input
            type="number"
            placeholder="Min price"
            className="price-input"
            value={minPrice}
            onChange={(event) =>
              setMinPrice(event.target.value)
            }
          />


          {/* Maximum Price */}

          <input
            type="number"
            placeholder="Max price"
            className="price-input"
            value={maxPrice}
            onChange={(event) =>
              setMaxPrice(event.target.value)
            }
          />


          {/* Sorting */}

          <select
            className="filter-select"
            value={ordering}
            onChange={(event) =>
              setOrdering(event.target.value)
            }
          >
            <option value="">
              Sort by
            </option>

            <option value="price">
              Price: Low to High
            </option>

            <option value="-price">
              Price: High to Low
            </option>

            <option value="name">
              Name: A to Z
            </option>

            <option value="-name">
              Name: Z to A
            </option>

            <option value="-created_at">
              Newest
            </option>
          </select>

        </div>


        {/* TOTAL PRODUCTS */}

        {!loading && !error && (
          <p className="product-count">
            {totalProducts} products found
          </p>
        )}


        {/* LOADING */}

        {loading && (
          <p>Loading products...</p>
        )}


        {/* ERROR */}

        {error && (
          <p>{error}</p>
        )}


        {/* PRODUCTS */}

        {!loading &&
          !error &&
          products.length > 0 && (

            <div className="product-grid">

              {products.map((product) => (

                <div
                  className="product-card"
                  key={product.id}
                >

                  {/* PRODUCT IMAGE */}

                  <div className="product-image">
                    <span>No Image</span>
                  </div>


                  {/* PRODUCT INFORMATION */}

                  <div className="product-info">

                    <p className="product-category">
                      {product.category_name}
                    </p>

                    <Link
                      to={`/products/${product.id}`}
                      className="product-name-link"
                    >
                      <h3>{product.name}</h3>
                    </Link>

                    <p className="product-description">
                      {product.description}
                    </p>


                    {/* PRICE + STOCK */}

                    <div className="product-bottom">

                      <span className="product-price">
                        ₹
                        {Number(
                          product.price
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </span>


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
                      className="add-cart-button"
                      disabled={
                        product.stock === 0 ||
                        addingToCart === product.id
                      }
                      onClick={() =>
                        handleAddToCart(product)
                      }
                    >
                      {addingToCart === product.id
                        ? "Adding..."
                        : addedToCart.includes(
                            product.id
                          )
                          ? "Added to Cart ✓"
                          : "Add to Cart"}
                    </button>

                  </div>

                </div>

              ))}

            </div>
          )}


        {/* NO PRODUCTS */}

        {!loading &&
          !error &&
          products.length === 0 && (

            <p>
              No products found.
            </p>
          )}


        {/* PAGINATION */}

        {!loading &&
          !error &&
          products.length > 0 && (

            <div className="pagination">

              <button
                className="pagination-button"
                disabled={!previousPage}
                onClick={
                  handlePreviousPage
                }
              >
                Previous
              </button>


              <span className="page-number">
                Page {currentPage}
              </span>


              <button
                className="pagination-button"
                disabled={!nextPage}
                onClick={
                  handleNextPage
                }
              >
                Next
              </button>

            </div>
          )}

      </section>
    </main>
  )
}

export default Products