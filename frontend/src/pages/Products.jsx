import { useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"

import api from "../services/api"
import { useCart } from "../context/CartContext"


function Products() {

  // =========================
  // CART
  // =========================

  const {
    addToCart,
  } = useCart()


  // =========================
  // URL SEARCH PARAMETERS
  // =========================

  const [searchParams, setSearchParams] =
    useSearchParams()


  // =========================
  // STATE
  // =========================

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [addingProduct, setAddingProduct] =
    useState(null)

  const [cartMessage, setCartMessage] =
    useState("")


  // =========================
  // FILTERS
  // =========================

  const [search, setSearch] = useState("")

  const [category, setCategory] = useState(
    searchParams.get("category") || ""
  )

  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [ordering, setOrdering] = useState("")


  // =========================
  // PAGINATION
  // =========================

  const [currentPage, setCurrentPage] = useState(1)

  const [totalProducts, setTotalProducts] =
    useState(0)

  const [nextPage, setNextPage] =
    useState(null)

  const [previousPage, setPreviousPage] =
    useState(null)


  // =========================
  // FETCH CATEGORIES
  // =========================

  useEffect(() => {

    const fetchCategories = async () => {

      try {

        const response =
          await api.get("/categories/")

        setCategories(
          response.data.results
        )

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
  // SYNC CATEGORY WITH URL
  // =========================

  useEffect(() => {

    const urlCategory =
      searchParams.get("category") || ""

    setCategory(urlCategory)

  }, [searchParams])


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


        // SEARCH

        if (search.trim()) {

          params.search =
            search.trim()

        }


        // CATEGORY

        if (category) {

          params.category =
            category

        }


        // MINIMUM PRICE

        if (minPrice) {

          params.min_price =
            minPrice

        }


        // MAXIMUM PRICE

        if (maxPrice) {

          params.max_price =
            maxPrice

        }


        // SORTING

        if (ordering) {

          params.ordering =
            ordering

        }


        const response =
          await api.get(
            "/products/",
            {
              params,
            }
          )


        // PRODUCTS

        setProducts(
          response.data.results
        )


        // PAGINATION

        setTotalProducts(
          response.data.count
        )

        setNextPage(
          response.data.next
        )

        setPreviousPage(
          response.data.previous
        )

      } catch (error) {

        console.error(
          "Failed to fetch products:",
          error
        )

        setError(
          "Unable to load products."
        )

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

  const handleAddToCart = async (
    product
  ) => {

    try {

      setAddingProduct(product.id)
      setCartMessage("")

      await addToCart(
        product.id,
        1
      )

      setCartMessage(
        `${product.name} added to cart.`
      )

      // Remove success message after 2 seconds

      setTimeout(() => {

        setCartMessage("")

      }, 2000)

    } catch (error) {

      console.error(
        "Failed to add product to cart:",
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
          "Unable to add product to cart."
        )

      }

    } finally {

      setAddingProduct(null)

    }

  }


  // =========================
  // CATEGORY CHANGE
  // =========================

  const handleCategoryChange = (
    event
  ) => {

    const value =
      event.target.value

    setCategory(value)

    if (value) {

      setSearchParams({
        category: value,
      })

    } else {

      setSearchParams({})

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


        {/* =========================
            PAGE HEADING
        ========================= */}

        <div className="section-heading">

          <h1>
            All Products
          </h1>

          <p>
            Explore our collection of products
            across different categories.
          </p>

        </div>


        {/* =========================
            CART SUCCESS MESSAGE
        ========================= */}

        {cartMessage && (

          <div className="cart-success-message">

            {cartMessage}

          </div>

        )}


        {/* =========================
            FILTERS
        ========================= */}

        <div className="product-filters">


          {/* SEARCH */}

          <input
            type="text"
            placeholder="Search products..."
            className="search-input"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />


          {/* CATEGORY */}

          <select
            className="filter-select"
            value={category}
            onChange={
              handleCategoryChange
            }
          >

            <option value="">
              All Categories
            </option>

            {categories.map(
              (item) => (

                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.name}
                </option>

              )
            )}

          </select>


          {/* MINIMUM PRICE */}

          <input
            type="number"
            placeholder="Min price"
            className="price-input"
            value={minPrice}
            onChange={(event) =>
              setMinPrice(
                event.target.value
              )
            }
          />


          {/* MAXIMUM PRICE */}

          <input
            type="number"
            placeholder="Max price"
            className="price-input"
            value={maxPrice}
            onChange={(event) =>
              setMaxPrice(
                event.target.value
              )
            }
          />


          {/* SORTING */}

          <select
            className="filter-select"
            value={ordering}
            onChange={(event) =>
              setOrdering(
                event.target.value
              )
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


        {/* =========================
            TOTAL PRODUCTS
        ========================= */}

        {!loading &&
          !error && (

            <p className="product-count">

              {totalProducts} products found

            </p>

          )}


        {/* =========================
            LOADING
        ========================= */}

        {loading && (

          <p>
            Loading products...
          </p>

        )}


        {/* =========================
            ERROR
        ========================= */}

        {error && (

          <p>
            {error}
          </p>

        )}


        {/* =========================
            PRODUCTS
        ========================= */}

        {!loading &&
          !error &&
          products.length > 0 && (

            <div className="product-grid">

              {products.map(
                (product) => (

                  <div
                    className="product-card"
                    key={product.id}
                  >


                    {/* =========================
                        PRODUCT IMAGE
                    ========================= */}

                    <div className="product-image">

                      {product.image_url ? (

                        <img
                          src={
                            product.image_url
                          }
                          alt={product.name}
                          className="product-image-img"
                        />

                      ) : (

                        <div className="product-image-placeholder">

                          No Image

                        </div>

                      )}

                    </div>


                    {/* =========================
                        PRODUCT INFORMATION
                    ========================= */}

                    <div className="product-info">


                      <p className="product-category">

                        {product.category_name}

                      </p>


                      <Link
                        to={`/products/${product.id}`}
                        className="product-name-link"
                      >

                        <h3>
                          {product.name}
                        </h3>

                      </Link>


                      <p className="product-description">

                        {product.description}

                      </p>


                      {/* =========================
                          PRICE + STOCK
                      ========================= */}

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

                            {product.stock <= 5
                              ? `Only ${product.stock} left`
                              : "In Stock"}

                          </span>

                        ) : (

                          <span className="stock-unavailable">

                            Out of Stock

                          </span>

                        )}

                      </div>


                      {/* =========================
                          ADD TO CART
                      ========================= */}

                      <button
                        type="button"
                        className="add-cart-button"
                        disabled={
                          product.stock === 0 ||
                          addingProduct === product.id
                        }
                        onClick={() =>
                          handleAddToCart(
                            product
                          )
                        }
                      >

                        {addingProduct ===
                        product.id
                          ? "Adding..."
                          : "Add to Cart"}

                      </button>

                    </div>

                  </div>

                )
              )}

            </div>

          )}


        {/* =========================
            NO PRODUCTS
        ========================= */}

        {!loading &&
          !error &&
          products.length === 0 && (

            <p>
              No products found.
            </p>

          )}


        {/* =========================
            PAGINATION
        ========================= */}

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