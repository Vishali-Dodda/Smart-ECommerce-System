import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import api from "../services/api"

function AdminCategories() {
  const [categories, setCategories] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] =
    useState(null)

  const [name, setName] = useState("")


  // =========================
  // FETCH CATEGORIES
  // =========================

  const fetchCategories = async () => {
    try {
      setLoading(true)
      setError("")

      let allCategories = []
      let url = "/categories/"

      while (url) {
        const response = await api.get(url)

        const results =
          response.data.results ||
          response.data

        allCategories = [
          ...allCategories,
          ...results,
        ]

        url = response.data.next
      }

      setCategories(allCategories)

    } catch (error) {
      console.error(
        "Failed to fetch categories:",
        error
      )

      setError(
        error.response?.data?.detail ||
        "Unable to load categories."
      )

    } finally {
      setLoading(false)
    }
  }


  // =========================
  // INITIAL LOAD
  // =========================

  useEffect(() => {
    fetchCategories()
  }, [])


  // =========================
  // OPEN ADD FORM
  // =========================

  const handleAddCategory = () => {
    setName("")
    setEditingCategory(null)
    setMessage("")
    setError("")
    setShowForm(true)
  }


  // =========================
  // OPEN EDIT FORM
  // =========================

  const handleEditCategory = (category) => {
    setName(category.name || "")
    setEditingCategory(category)
    setMessage("")
    setError("")
    setShowForm(true)
  }


  // =========================
  // CLOSE FORM
  // =========================

  const closeForm = () => {
    setName("")
    setEditingCategory(null)
    setShowForm(false)
  }


  // =========================
  // SAVE CATEGORY
  // =========================

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError("")
    setMessage("")

    const trimmedName = name.trim()

    if (!trimmedName) {
      setError(
        "Category name is required."
      )

      return
    }

    try {

      if (editingCategory) {

        await api.put(
          `/categories/${editingCategory.id}/`,
          {
            name: trimmedName,
          }
        )

        setMessage(
          "Category updated successfully."
        )

      } else {

        await api.post(
          "/categories/",
          {
            name: trimmedName,
          }
        )

        setMessage(
          "Category added successfully."
        )
      }

      closeForm()

      await fetchCategories()

    } catch (error) {
      console.error(
        "Failed to save category:",
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
          "Unable to save category."
        )

      } else {

        setError(
          "Unable to save category."
        )
      }
    }
  }


  // =========================
  // DELETE CATEGORY
  // =========================

  const handleDeleteCategory = async (
    category
  ) => {

    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${category.name}"?`
      )

    if (!confirmed) {
      return
    }

    try {

      setError("")
      setMessage("")

      await api.delete(
        `/categories/${category.id}/`
      )

      setMessage(
        "Category deleted successfully."
      )

      await fetchCategories()

    } catch (error) {
      console.error(
        "Failed to delete category:",
        error
      )

      setError(
        error.response?.data?.detail ||
        "Unable to delete category."
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
              Categories
            </h1>

            <p>
              Manage product categories.
            </p>

          </div>


          <button
            className="admin-primary-button"
            onClick={
              handleAddCategory
            }
          >
            + Add Category
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
                  {editingCategory
                    ? "Edit Category"
                    : "New Category"}
                </span>

                <h2>
                  {editingCategory
                    ? editingCategory.name
                    : "Add Category"}
                </h2>

              </div>


              <button
                type="button"
                className="admin-close-button"
                onClick={closeForm}
              >
                ×
              </button>

            </div>


            <form
              className="admin-product-form"
              onSubmit={handleSubmit}
            >

              <div className="admin-form-group">

                <label>
                  Category Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(
                      event.target.value
                    )
                  }
                  placeholder="Enter category name"
                />

              </div>


              <div className="admin-form-actions">

                <button
                  type="button"
                  className="admin-secondary-button"
                  onClick={closeForm}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="admin-primary-button"
                >
                  {editingCategory
                    ? "Update Category"
                    : "Add Category"}
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
            Loading categories...
          </p>
        )}


        {/* =========================
            CATEGORY TABLE
        ========================= */}

        {!loading &&
          categories.length > 0 && (

            <div className="admin-table-wrapper">

              <table className="admin-table">

                <thead>

                  <tr>

                    <th>
                      Category
                    </th>

                    <th>
                      ID
                    </th>

                    <th>
                      Actions
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {categories.map(
                    (category) => (

                      <tr
                        key={category.id}
                      >

                        <td>

                          <strong>
                            {category.name}
                          </strong>

                        </td>


                        <td>
                          #{category.id}
                        </td>


                        <td>

                          <div className="admin-action-buttons">

                            <button
                              className="admin-edit-button"
                              onClick={() =>
                                handleEditCategory(
                                  category
                                )
                              }
                            >
                              Edit
                            </button>


                            <button
                              className="admin-delete-button"
                              onClick={() =>
                                handleDeleteCategory(
                                  category
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
          categories.length === 0 && (

            <div className="admin-empty">

              <h2>
                No categories found
              </h2>

              <p>
                Add your first category to
                get started.
              </p>

            </div>

          )}

      </section>

    </main>
  )
}

export default AdminCategories