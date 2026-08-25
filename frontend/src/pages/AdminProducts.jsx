import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import api from "../services/api"

function AdminProducts() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image_url:"",
    price: "",
    stock: "",
    category: "",
    is_active: true,
  })


  // =========================
  // FETCH PRODUCTS
  // =========================

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError("")

      let allProducts = []
      let url = "/products/"

      while (url) {
        const response = await api.get(url)

        const results =
          response.data.results ||
          response.data

        allProducts = [
          ...allProducts,
          ...results,
        ]

        url = response.data.next
      }

      setProducts(allProducts)

    } catch (error) {
      console.error(
        "Failed to fetch products:",
        error
      )

      setError(
        error.response?.data?.detail ||
        "Unable to load products."
      )

    } finally {
      setLoading(false)
    }
  }


  // =========================
  // FETCH CATEGORIES
  // =========================

  const fetchCategories = async () => {
    try {
      const response =
        await api.get("/categories/")

      let allCategories = []
      let url = "/categories/"

      while (url) {
        const currentResponse =
          url === "/categories/"
            ? response
            : await api.get(url)

        const results =
          currentResponse.data.results ||
          currentResponse.data

        allCategories = [
          ...allCategories,
          ...results,
        ]

        url = currentResponse.data.next
      }

      setCategories(allCategories)

    } catch (error) {
      console.error(
        "Failed to fetch categories:",
        error
      )
    }
  }


  // =========================
  // INITIAL LOAD
  // =========================

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])


  // =========================
  // FORM CHANGE
  // =========================

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target

    setFormData((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }))
  }


  // =========================
  // RESET FORM
  // =========================

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      image_url:"",
      price: "",
      stock: "",
      category: "",
      is_active: true,
    })

    setEditingProduct(null)
    setShowForm(false)
  }


  // =========================
  // OPEN ADD FORM
  // =========================

  const handleAddProduct = () => {
    setError("")
    setMessage("")

    setFormData({
      name: "",
      description: "",
      image_url:"",
      price: "",
      stock: "",
      category: "",
      is_active: true,
    })

    setEditingProduct(null)
    setShowForm(true)
  }


  // =========================
  // OPEN EDIT FORM
  // =========================

  const handleEditProduct = (product) => {
    setError("")
    setMessage("")

    setEditingProduct(product)

    setFormData({
      name: product.name || "",
      description: product.description || "",
      image_url: product.image_url || "",
      price: product.price || "",
      stock: product.stock ?? "",
      category: product.category || "",
      is_active: product.is_active,
    })

    setShowForm(true)
  }


  // =========================
  // SAVE PRODUCT
  // =========================

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError("")
    setMessage("")


    if (!formData.name.trim()) {
      setError(
        "Product name is required."
      )
      return
    }


    if (
      !formData.price ||
      Number(formData.price) <= 0
    ) {
      setError(
        "Price must be greater than zero."
      )
      return
    }


    if (
      formData.stock === "" ||
      Number(formData.stock) < 0
    ) {
      setError(
        "Stock cannot be negative."
      )
      return
    }


    if (!formData.category) {
      setError(
        "Please select a category."
      )
      return
    }


    if (
      formData.is_active &&
      Number(formData.stock) === 0
    ) {
      setError(
        "A product cannot be active when stock is zero."
      )
      return
    }


    const data = {
      name: formData.name.trim(),
      description:
        formData.description.trim(),
      image_url: formData.image_url.trim(),
      price: Number(formData.price),
      stock: Number(formData.stock),
      category: Number(formData.category),
      is_active: formData.is_active,
    }


    try {

      if (editingProduct) {

        await api.put(
          `/products/${editingProduct.id}/`,
          data
        )

        setMessage(
          "Product updated successfully."
        )

      } else {

        await api.post(
          "/products/",
          data
        )

        setMessage(
          "Product added successfully."
        )
      }


      resetForm()

      await fetchProducts()

    } catch (error) {
      console.error(
        "Failed to save product:",
        error
      )

      const responseData =
        error.response?.data

      if (
        typeof responseData === "object"
      ) {

        const firstError =
          Object.values(responseData)
            .flat()
            .find(Boolean)

        setError(
          firstError ||
          "Unable to save product."
        )

      } else {

        setError(
          "Unable to save product."
        )
      }
    }
  }


  // =========================
  // DELETE PRODUCT
  // =========================

  const handleDeleteProduct = async (
    product
  ) => {

    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${product.name}"?`
      )

    if (!confirmed) {
      return
    }


    try {

      setError("")
      setMessage("")

      await api.delete(
        `/products/${product.id}/`
      )

      setMessage(
        "Product deleted successfully."
      )

      await fetchProducts()

    } catch (error) {

      console.error(
        "Failed to delete product:",
        error
      )

      setError(
        error.response?.data?.detail ||
        "Unable to delete product."
      )
    }
  }


  // =========================
  // TOGGLE ACTIVE STATUS
  // =========================

  const handleToggleActive = async (
    product
  ) => {

    if (
      !product.is_active &&
      product.stock === 0
    ) {
      setError(
        "A product cannot be activated when stock is zero."
      )

      return
    }


    try {

      setError("")
      setMessage("")

      await api.patch(
        `/products/${product.id}/`,
        {
          is_active:
            !product.is_active,
        }
      )

      setMessage(
        product.is_active
          ? "Product deactivated successfully."
          : "Product activated successfully."
      )

      await fetchProducts()

    } catch (error) {

      console.error(
        "Failed to update product status:",
        error
      )

      setError(
        error.response?.data?.detail ||
        "Unable to update product status."
      )
    }
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
              Products
            </h1>

            <p>
              Manage ShopFusion products.
            </p>

          </div>


          <button
            className="admin-primary-button"
            onClick={handleAddProduct}
          >
            + Add Product
          </button>

        </div>


        {/* =========================
            SUCCESS
        ========================= */}

        {message && (
          <div className="admin-success">
            {message}
          </div>
        )}


        {/* =========================
            ERROR
        ========================= */}

        {error && (
          <div className="admin-error">
            {error}
          </div>
        )}


        {/* =========================
            FORM
        ========================= */}

        {showForm && (

          <div className="admin-form-card">

            <div className="admin-form-header">

              <div>

                <span>
                  {editingProduct
                    ? "Edit Product"
                    : "New Product"}
                </span>

                <h2>
                  {editingProduct
                    ? editingProduct.name
                    : "Add Product"}
                </h2>

              </div>

              <button
                type="button"
                className="admin-close-button"
                onClick={resetForm}
              >
                ×
              </button>

            </div>


            <form
              className="admin-product-form"
              onSubmit={handleSubmit}
            >


              {/* NAME */}

              <div className="admin-form-group">

                <label>
                  Product Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter product name"
                />

              </div>


              {/* DESCRIPTION */}

              <div className="admin-form-group">

                <label>
                  Description
                </label>

                <textarea
                  name="description"
                  value={
                    formData.description
                  }
                  onChange={handleChange}
                  placeholder="Enter product description"
                  rows="4"
                />

              </div>

              <div className="admin-form-group">

                <label>
                    Product Image URL
                </label>

                <input
                    type="url"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleChange}
                    placeholder="https://example.com/product-image.jpg"
                />

                <small className="admin-form-help">
                    Add a direct URL to the product image.
                </small>

              </div>

              {/* PRICE + STOCK */}

              <div className="admin-form-row">

                <div className="admin-form-group">

                  <label>
                    Price
                  </label>

                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="Enter price"
                    min="0"
                    step="0.01"
                  />

                </div>


                <div className="admin-form-group">

                  <label>
                    Stock
                  </label>

                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    placeholder="Enter stock"
                    min="0"
                  />

                </div>

              </div>


              {/* CATEGORY */}

              <div className="admin-form-group">

                <label>
                  Category
                </label>

                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >

                  <option value="">
                    Select Category
                  </option>

                  {categories.map(
                    (category) => (

                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </option>

                    )
                  )}

                </select>

              </div>


              {/* ACTIVE */}

              <label className="admin-checkbox">

                <input
                  type="checkbox"
                  name="is_active"
                  checked={
                    formData.is_active
                  }
                  onChange={handleChange}
                />

                <span>
                  Product is active
                </span>

              </label>


              {/* ACTIONS */}

              <div className="admin-form-actions">

                <button
                  type="button"
                  className="admin-secondary-button"
                  onClick={resetForm}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="admin-primary-button"
                >
                  {editingProduct
                    ? "Update Product"
                    : "Add Product"}
                </button>

              </div>

            </form>

          </div>

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
            PRODUCT TABLE
        ========================= */}

        {!loading &&
          products.length > 0 && (

            <div className="admin-table-wrapper">

              <table className="admin-table">

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
                      Actions
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {products.map(
                    (product) => (

                      <tr
                        key={product.id}
                      >

                        <td>

                          <strong>
                            {product.name}
                          </strong>

                        </td>


                        <td>
                          #{product.id}
                        </td>


                        <td>
                          {product.category_name}
                        </td>


                        <td>
                          ₹
                          {Number(
                            product.price
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </td>


                        <td>
                          {product.stock}
                        </td>


                        <td>

                          <span
                            className={
                              product.is_active
                                ? "admin-active-status"
                                : "admin-inactive-status"
                            }
                          >
                            {product.is_active
                              ? "Active"
                              : "Inactive"}
                          </span>

                        </td>


                        <td>

                          <div className="admin-action-buttons">

                            <button
                              className="admin-edit-button"
                              onClick={() =>
                                handleEditProduct(
                                  product
                                )
                              }
                            >
                              Edit
                            </button>


                            <button
                              className="admin-toggle-button"
                              onClick={() =>
                                handleToggleActive(
                                  product
                                )
                              }
                            >
                              {product.is_active
                                ? "Disable"
                                : "Enable"}
                            </button>


                            <button
                              className="admin-delete-button"
                              onClick={() =>
                                handleDeleteProduct(
                                  product
                                )
                              }
                            >
                              Delete
                            </button>

                          </div>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}


        {/* =========================
            EMPTY
        ========================= */}

        {!loading &&
          products.length === 0 && (

            <div className="admin-empty">

              <h2>
                No products found
              </h2>

              <p>
                Add your first product to
                get started.
              </p>

            </div>

          )}

      </section>

    </main>
  )
}

export default AdminProducts