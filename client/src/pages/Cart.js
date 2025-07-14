"use client";

import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useCart } from "../contexts/CartContext";
import { FaTrash, FaMinus, FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";

const Cart = () => {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
  } = useCart();

  const handleRemove = (item) => {
    removeFromCart(item.id);
    toast.info(`${item.name} removed from cart`);
  };

  const handleClear = () => {
    clearCart();
    toast.info("Cart cleared");
  };

  const handleDecrease = (item) => {
    updateQuantity(item.id, item.quantity - 1);
    toast.success("Quantity updated");
  };

  const handleIncrease = (item) => {
    updateQuantity(item.id, item.quantity + 1);
    toast.success("Quantity updated");
  };

  if (cartItems.length === 0) {
    return (
      <>
        <Helmet>
          <title>Shopping Cart - FreshFish</title>
        </Helmet>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Your Cart is Empty
            </h1>
            <p className="text-gray-600 mb-8">
              Looks like you haven't added any fish to your cart yet.
            </p>
            <Link to="/shop" className="btn-primary">
              Start Shopping
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Shopping Cart ({cartItems.length} items) - FreshFish</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Shopping Cart</h1>
          <button
            onClick={handleClear}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-6 rounded-lg shadow-md"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.image || "/placeholder.png"}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/placeholder.png";
                      }}
                    />

                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {item.name}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {item.category?.name}
                      </p>
                      <p className="text-blue-600 font-semibold">
                        KES {item.price.toFixed(2)} each
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleDecrease(item)}
                        className="p-2 hover:bg-gray-100 rounded-full"
                      >
                        <FaMinus size={12} />
                      </button>
                      <span className="px-4 py-2 bg-gray-100 rounded-lg min-w-[3rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleIncrease(item)}
                        className="p-2 hover:bg-gray-100 rounded-full"
                      >
                        <FaPlus size={12} />
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-800">
                        KES {(item.price * item.quantity).toFixed(2)}
                      </p>
                      <button
                        onClick={() => handleRemove(item)}
                        className="text-red-600 hover:text-red-800 mt-2"
                      >
                        <FaTrash size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-md sticky top-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Order Summary
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">
                    KES {getCartTotal().toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold">Free</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-blue-600">
                      KES {getCartTotal().toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <Link to="/checkout" className="w-full btn-primary block text-center">
                Proceed to Checkout
              </Link>

              <Link to="/shop" className="w-full btn-secondary block text-center mt-3">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cart;
