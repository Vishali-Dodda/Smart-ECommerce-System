import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react"

import api from "../services/api"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("access_token")
  )

  const [refreshToken, setRefreshToken] = useState(
    localStorage.getItem("refresh_token")
  )

  const [user, setUser] = useState(null)

  const [loading, setLoading] = useState(true)


  // =========================
  // LOGOUT
  // =========================

  const logout = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")

    setAccessToken(null)
    setRefreshToken(null)
    setUser(null)
    setLoading(false)
  }


  // =========================
  // GET CURRENT USER
  // =========================

  const fetchUser = async () => {
    try {
      const response = await api.get(
      "/auth/me/"
      )
      setUser(response.data)

    } catch (error) {
      console.error(
        "Failed to fetch user:",
        error
      )

      logout()
    } finally {
      setLoading(false)
    }
  }


  // =========================
  // LOGIN
  // =========================

  const login = async (username, password) => {
    const response = await api.post(
      "/auth/login/",
      {
        username,
        password,
      }
    )

    const { access, refresh } = response.data

    localStorage.setItem(
      "access_token",
      access
    )

    localStorage.setItem(
      "refresh_token",
      refresh
    )

    setAccessToken(access)
    setRefreshToken(refresh)

    // Get current user
    const userResponse = await api.get(
      "/auth/me/",
      {
        headers: {
          Authorization: `Bearer ${access}`,
        },
      }
    )

    setUser(userResponse.data)

    return response.data
  }


  // =========================
  // RESTORE SESSION
  // =========================

  useEffect(() => {
    if (accessToken) {
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [])


  const isAuthenticated =
    Boolean(accessToken)


  return (
    <AuthContext.Provider
      value={{
        accessToken,
        refreshToken,
        user,
        loading,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}


export function useAuth() {
  return useContext(AuthContext)
}