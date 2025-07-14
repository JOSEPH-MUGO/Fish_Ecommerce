// File: client/src/contexts/CartContext.js
"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getProductImage } from "../utils/imageUtils";

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Lock body scroll when cart is open
  useEffect(() => {
    document.body.style.overflow = isCartOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isCartOpen]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) {
      try {
        setCartItems(JSON.parse(saved));
      } catch {
        localStorage.removeItem("cart");
      }
    }
  }, []);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, qty = 1) => {
    setCartItems((prev) => {
      const image = getProductImage(product.images);
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + qty } : i
        );
      }
      return [...prev, { ...product, quantity: qty, image }];
    });
    toast.success(`${product.name} added to cart!`);
  };

  const removeFromCart = (productId) => {
    // find item for toast before state update
    const item = cartItems.find((i) => i.id === productId);
    setCartItems((prev) => prev.filter((i) => i.id !== productId));
    if (item) {
      toast.info(`${item.name} removed from cart`);
    }
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((i) => (i.id === productId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setCartItems([]);
    toast.info("Cart cleared");
  };

  const getCartItemsCount = () =>
    cartItems.reduce((sum, i) => sum + i.quantity, 0);

  const getCartTotal = () =>
    cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const toggleCart = () => setIsCartOpen((open) => !open);
  const closeCart = () => setIsCartOpen(false);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartItemsCount,
        getCartTotal,
        isCartOpen,
        toggleCart,
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
