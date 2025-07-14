// File: client/src/components/CartModal.js
"use client"
import { FaTrash, FaMinus, FaPlus, FaTimes } from "react-icons/fa"
import { useCart } from "../contexts/CartContext"
import { Link } from "react-router-dom"

const CartModal = () => {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    getCartTotal,
    isCartOpen,
    closeCart
  } = useCart()

  if (!isCartOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Background overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={closeCart}></div>

      <div className="fixed inset-y-0 right-0 max-w-full flex">
        <div className="relative w-screen max-w-md">
          <div className="h-full flex flex-col bg-white shadow-xl">
            <div className="flex-1 overflow-y-auto py-6 px-4 sm:px-6">
              <div className="flex items-start justify-between">
                <h2 className="text-lg font-medium text-gray-900">Shopping cart</h2>
                <button
                  type="button"
                  className="ml-3 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-500 focus:outline-none"
                  onClick={closeCart}
                >
                  <span className="sr-only">Close panel</span>
                  <FaTimes className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>

              <div className="mt-8">
                <div className="flow-root">
                  {cartItems.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Your cart is empty.</p>
                      <button
                        onClick={closeCart}
                        className="mt-4 text-sm text-blue-600 hover:text-blue-800"
                      >
                        Continue Shopping
                      </button>
                    </div>
                  ) : (
                    <ul className="-my-6 divide-y divide-gray-200">
                      {cartItems.map((item) => (
                        <li key={item.id} className="py-6 flex">
                          <div className="flex-shrink-0 w-24 h-24 border border-gray-200 rounded-md overflow-hidden">
                            <img
                              src={item.image || "/placeholder.png"}
                              alt={item.name}
                              className="w-full h-full object-cover object-center"
                            />
                          </div>

                          <div className="ml-4 flex-1 flex flex-col">
                            <div>
                              <div className="flex justify-between text-base font-medium text-gray-900">
                                <h3>{item.name}</h3>
                                <p className="ml-4">KES {item.price.toFixed(2)}</p>
                              </div>
                              <p className="mt-1 text-sm text-gray-500">{item.category?.name}</p>
                            </div>
                            <div className="flex-1 flex items-end justify-between text-sm">
                              <div className="flex items-center">
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="p-1 rounded-full hover:bg-gray-100"
                                >
                                  <FaMinus size={12} />
                                </button>
                                <span className="mx-2 text-gray-700">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="p-1 rounded-full hover:bg-gray-100"
                                >
                                  <FaPlus size={12} />
                                </button>
                              </div>

                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="font-medium text-red-600 hover:text-red-500"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {cartItems.length > 0 && (
              <div className="border-t border-gray-200 py-6 px-4 sm:px-6">
                <div className="flex justify-between text-base font-medium text-gray-900">
                  <p>Subtotal</p>
                  <p>KES {getCartTotal().toFixed(2)}</p>
                </div>
                <p className="mt-0.5 text-sm text-gray-500">Shipping and taxes calculated at checkout.</p>
                <div className="mt-6">
                  <Link
                    to="/checkout"
                    onClick={closeCart}
                    className="flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Checkout
                  </Link>
                </div>
                <div className="mt-4 flex justify-center">
                  <button
                    type="button"
                    onClick={closeCart}
                    className="text-sm font-medium text-blue-600 hover:text-blue-500"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartModal