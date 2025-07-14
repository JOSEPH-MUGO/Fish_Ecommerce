// client/src/pages/Contact.js
"use client";

import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock } from "react-icons/fa";
import { toast } from "react-toastify";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  

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
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          phone: formData.phone || undefined, // Send undefined instead of empty string
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle validation errors
        if (data.errors) {
          const errorMessages = data.errors.map((err) => err.msg).join("\n");
          throw new Error(errorMessages);
        }
        throw new Error(data.message || "Failed to send message");
      }

      toast.success(data.message);
      setFormData({ name: "", email: "", message: "", phone: "" });
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(
        error.message || "An error occurred while sending the message."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Contact Us - FreshFish</title>
        <meta
          name="description"
          content="Get in touch with FreshFish. Contact us for questions about our fresh fish and seafood delivery service."
        />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Contact Us</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Have questions about our fresh fish? Need help with your order?
            We're here to help! Get in touch with us.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-6">Send us a Message</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                    placeholder="Enter your email address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number (optional)
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone || ""}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="input-field"
                    placeholder="Tell us how we can help you..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                    loading ? "bg-gray-400 cursor-not-allowed" : "btn-primary"
                  }`}
                >
                  {loading ? "Sending..." : "Send Message"}
                </button>
              </form>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-6">Get in Touch</h2>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <FaPhone className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Phone</h3>
                    <p className="text-gray-600">+254 0212345678</p>
                    <p className="text-sm text-gray-500">Mon-Fri 8AM-6PM</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <FaEnvelope className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Email</h3>
                    <p className="text-gray-600">info@freshfish.com</p>
                    <p className="text-sm text-gray-500">
                      We'll respond instantly during business hours
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <FaMapMarkerAlt className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Address</h3>
                    <p className="text-gray-600">
                      Kai Plaza, 2nd Floor, Suite 5 FreshFish
                      <br />
                      Tom Mboya St, Nairobi City
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <FaClock className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      Business Hours
                    </h3>
                    <div className="text-gray-600 text-sm">
                      <p>Monday - Friday: 6:00 AM - 8:00 PM</p>
                      <p>Saturday: 7:00 AM - 9:00 PM</p>
                      <p>Sunday: 8:00 AM - 8:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="w-full h-64 rounded-lg overflow-hidden shadow-inner">
              <iframe
                title="FreshFish Location"
                src="https://www.google.com/maps/embed?pb=!1m28!1m12!1m3!1d404.99072810468635!2d36.824970822011956!3d-1.283558765326944!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m13!3e6!4m5!1s0x182f10d601830001%3A0x635070e1fb7feece!2sKai%20Plaza%20-%20%20With%20Bata%20Shop!3m2!1d-1.283549!2d36.8248432!4m5!1s0x182f1129d3e9e4a7%3A0xd7a2234ccaf4740e!2sTom%20Mboya%20St%2C%20Nairobi!3m2!1d-1.2836341!2d36.8250898!5e0!3m2!1sen!2ske!4v1752481750139!5m2!1sen!2ske"
                className="w-full h-full"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;
