// File: client/src/pages/Checkout.js
"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import axios from "axios";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    customerfirstName: user?.firstName || "",
    customerlastName: user?.lastName || "",
    customerEmail: user?.email || "",
    customerPhone: user?.phone || "",
    shippingAddress: "",
    notes: "",
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        total: getCartTotal(),
        userId: user?.id || null,
        customerName: `${formData.customerfirstName} ${formData.customerlastName}`,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        shippingAddress: formData.shippingAddress,
      };

      await axios.post(`${process.env.REACT_APP_API_URL}/orders`, orderData);

      toast.success("Order placed successfully!");
      clearCart();
      navigate("/orders");
    } catch (error) {
        console.error("Error placing order:", error.response?.data || error.message);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate("/cart");
    }
  }, [cartItems, navigate]);

  if (cartItems.length === 0) return null;

  return (
    <>
      <Helmet>
        <title>Checkout - FreshFish</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">
                  Delivery Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      First Name
                    </label>
                    <input
                      name="customerfirstName"
                      value={formData.customerfirstName}
                      onChange={handleInputChange}
                      required
                      className="input-field mt-1"
                      placeholder="Enter your first name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Last Name
                    </label>
                    <input
                      name="customerlastName"
                      value={formData.customerlastName}
                      onChange={handleInputChange}
                      required
                      className="input-field mt-1"
                      placeholder="Enter your last name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="customerEmail"
                      value={formData.customerEmail}
                      onChange={handleInputChange}
                      required
                      className="input-field mt-1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="customerPhone"
                      value={formData.customerPhone}
                      onChange={handleInputChange}
                      required
                      className="input-field mt-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Address *
                  </label>
                  <textarea
                    name="shippingAddress"
                    value={formData.shippingAddress}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="input-field"
                    placeholder="Enter your complete delivery address"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                  loading ? "bg-gray-400 cursor-not-allowed" : "btn-primary"
                }`}
              >
                {loading
                  ? "Placing Order..."
                  : `Place Order - KES ${getCartTotal().toFixed(2)}`}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={item.images || "/placeholder.png"}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-600">
                          Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold">
                      KES {(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>KES {getCartTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total</span>
                  <span className="text-blue-600">
                    KES {getCartTotal().toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Checkout;
