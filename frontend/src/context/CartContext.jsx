import { createContext, useContext, useEffect, useState } from "react"
import api from "../services/api"
import { useAuth } from "./AuthContext"

const CartContext = createContext(null)


export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth()

  const [cart, setCart] = useState(null)
  const [cartCount, setCartCount] = useState(0)
  const [loading, setLoading] = useState(false)


  // =========================
  // UPDATE CART COUNT
  // =========================

  const updateCartCount = (cartData) => {
    const items = cartData?.items || []

    const totalQuantity = items.reduce(
      (total, item) =>
        total + item.quantity,
      0
    )

    setCartCount(totalQuantity)
  }


  // =========================
  // FETCH CART
  // =========================

  const fetchCart = async () => {

    if (!isAuthenticated) {
      setCart(null)
      setCartCount(0)
      return
    }

    try {
      setLoading(true)

      const response = await api.get(
        "/cart/"
      )

      setCart(response.data)

      updateCartCount(
        response.data
      )

    } catch (error) {
      console.error(
        "Failed to fetch cart:",
        error
      )

      setCart(null)
      setCartCount(0)

    } finally {
      setLoading(false)
    }
  }


  // =========================
  // FETCH WHEN USER LOGS IN
  // =========================

  useEffect(() => {
    fetchCart()
  }, [isAuthenticated])


  // =========================
  // ADD TO CART
  // =========================

  const addToCart = async (
    productId,
    quantity = 1
  ) => {

    const response = await api.post(
      "/cart/items/",
      {
        product: productId,
        quantity,
      }
    )

    await fetchCart()

    return response.data
  }


  // =========================
  // UPDATE QUANTITY
  // =========================

  const updateQuantity = async (
    itemId,
    quantity
  ) => {

    const response = await api.patch(
      `/cart/items/${itemId}/`,
      {
        quantity,
      }
    )

    await fetchCart()

    return response.data
  }


  // =========================
  // REMOVE ITEM
  // =========================

  const removeItem = async (
    itemId
  ) => {

    await api.delete(
      `/cart/items/${itemId}/delete/`
    )

    await fetchCart()
  }


  // =========================
  // CLEAR CART
  // =========================

  const clearCart = async () => {

    await api.delete(
      "/cart/clear/"
    )

    await fetchCart()
  }


  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        loading,

        fetchCart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}


export function useCart() {
  const context = useContext(
    CartContext
  )

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    )
  }

  return context
}