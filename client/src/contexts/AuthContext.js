// / client/src/contexts/AuthContext.js
"use client"

import { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-toastify"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem("token"))

  // Configure axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
    } else {
      delete axios.defaults.headers.common["Authorization"]
    }
  }, [token])

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await axios.get(`${process.env.REACT_APP_API_URL}/auth/me`)
          setUser(response.data.user)
        } catch (error) {
          console.error("Auth check failed:", error)
          logout()
        }
      }
      setLoading(false)
    }

    checkAuth()
  }, [token])

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/login`, {
        email,
        password,
      })

      const { token: newToken, user: userData } = response.data

      localStorage.setItem("token", newToken)
      setToken(newToken)
      setUser(userData)

      
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || "Login failed"
      toast.error(message)
      return { success: false, message }
    }
  }

  const register = async (userData) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/register`, userData)

      const { token: newToken, user: newUser } = response.data

      localStorage.setItem("token", newToken)
      setToken(newToken)
      setUser(newUser)

      
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed"
      toast.error(message)
      return { success: false, message }
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    setToken(null)
    setUser(null)
    delete axios.defaults.headers.common["Authorization"]
    toast.info("Logged out successfully")
  }

  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put(`${process.env.REACT_APP_API_URL}/auth/profile`, profileData)
      setUser(response.data.user)
      toast.success("Profile updated successfully!")
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || "Profile update failed"
      toast.error(message)
      return { success: false, message }
    }
  }

  const isAuthenticated = () => {
    return !!user && !!token
  }

  const isAdmin = () => {
    return user?.role === "ADMIN"
  }

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated,
    isAdmin,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
