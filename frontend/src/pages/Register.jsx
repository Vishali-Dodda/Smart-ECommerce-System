import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import api from "../services/api"

function Register() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError("")
    setSuccess("")

    // Check passwords
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)

    try {
      await api.post("/auth/register/", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      })

      setSuccess(
        "Account created successfully. Redirecting to login..."
      )

      setTimeout(() => {
        navigate("/login")
      }, 1500)

    } catch (error) {
      console.error(
        "Registration failed:",
        error
      )

      if (error.response?.data) {
        const data = error.response.data

        if (data.username) {
          setError(
            `Username: ${data.username[0]}`
          )
        } else if (data.email) {
          setError(
            `Email: ${data.email[0]}`
          )
        } else if (data.password) {
          setError(
            `Password: ${data.password[0]}`
          )
        } else if (data.detail) {
          setError(data.detail)
        } else {
          setError(
            "Registration failed. Please check your details."
          )
        }
      } else {
        setError(
          "Unable to connect to the server."
        )
      }

    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">

        <div className="auth-header">
          <h1>Create Your Account</h1>

          <p>
            Join ShopFusion and start shopping.
          </p>
        </div>


        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}


        {success && (
          <div className="auth-success">
            {success}
          </div>
        )}


        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >

          <div className="form-group">
            <label htmlFor="username">
              Username
            </label>

            <input
              id="username"
              name="username"
              type="text"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>


          <div className="form-group">
            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>


          <div className="form-group">
            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>


          <div className="form-group">
            <label htmlFor="confirmPassword">
              Confirm Password
            </label>

            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>


          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>

        </form>


        <div className="auth-footer">
          <p>
            Already have an account?{" "}

            <Link to="/login">
              Login
            </Link>
          </p>
        </div>

      </div>
    </main>
  )
}

export default Register