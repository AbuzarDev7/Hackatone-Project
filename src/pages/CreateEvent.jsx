import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseconfig/firebase";


function CreateEvent() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [totalTickets, setTotalTickets] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!name || !location || !startDate || !endDate || !totalTickets || !price) {
      setError("Please fill all required fields!");
      return;
    }

    // Date validation
    if (new Date(startDate) > new Date(endDate)) {
      setError("End date must be after start date!");
      return;
    }

    // Number validation
    if (Number(totalTickets) <= 0) {
      setError("Total tickets must be greater than 0!");
      return;
    }

    if (Number(price) < 0) {
      setError("Price cannot be negative!");
      return;
    }

    setLoading(true);
    try {
      const eventData = {
        name: name.trim(),
        location: location.trim(),
        startDate,
        endDate,
        totalTickets: Number(totalTickets),
        price: Number(price),
        sold: 0,
        imageUrl: imageUrl.trim() || "",
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, "events"), eventData);
      
      console.log(" Event created successfully:", docRef.id);
      
      // Show success message
      alert(" Event created successfully!");
      
      // Navigate to events list
      navigate("/dashboard");
      
    } catch (err) {
      console.error(" Error creating event:", err);
      setError("Failed to create event. Please try again!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-gray-100 flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">

        {/* LEFT PANEL */}
        <div className="hidden md:flex md:w-1/2 flex-col justify-center px-10 py-12 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
          <div className="mb-6">
            <h2 className="text-4xl font-bold leading-tight">
              Create Your Next <span className="text-emerald-400 block mt-2">Amazing Event</span>
            </h2>
          </div>
          
          <p className="mt-6 text-gray-300 text-sm leading-relaxed max-w-sm">
            Add event details, set dates, manage tickets, and start selling. Everything you need in one simple platform.
          </p>
          
          <ul className="mt-8 space-y-3 text-gray-300 text-sm">
            <li className="flex items-center">
              <span className="text-emerald-400 mr-3 text-xl">✓</span>
              Set event location & dates
            </li>
            <li className="flex items-center">
              <span className="text-emerald-400 mr-3 text-xl">✓</span>
              Configure ticket pricing
            </li>
            <li className="flex items-center">
              <span className="text-emerald-400 mr-3 text-xl">✓</span>
              Manage ticket inventory
            </li>
            <li className="flex items-center">
              <span className="text-emerald-400 mr-3 text-xl">✓</span>
              Upload event imagery
            </li>
            <li className="flex items-center">
              <span className="text-emerald-400 mr-3 text-xl">✓</span>
              Track real-time sales
            </li>
            <li className="flex items-center">
              <span className="text-emerald-400 mr-3 text-xl">✓</span>
              Generate QR code tickets
            </li>
          </ul>

          {/* Navigation Links */}
          <div className="mt-10 space-y-2">
       
     
          </div>
        </div>

        {/* RIGHT FORM */}
        <div className="w-full md:w-1/2 px-8 py-10 flex flex-col justify-center">
          <h3 className="text-3xl font-bold text-gray-800 mb-2">Event Details</h3>
          <p className="text-gray-600 mb-6">Fill in the information below to create your event</p>

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 border-2 border-red-300 rounded-xl p-4 animate-shake">
              <p className="text-red-700 font-semibold">❌ {error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Event Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Event Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Tech Conference 2025"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 px-4 py-3 rounded-xl text-sm
                           focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                required
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                placeholder="e.g. Karachi Expo Center"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full border border-gray-300 px-4 py-3 rounded-xl text-sm
                           focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                required
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full border border-gray-300 px-4 py-3 rounded-xl text-sm
                             focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  End Date *
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || new Date().toISOString().split('T')[0]}
                  className="w-full border border-gray-300 px-4 py-3 rounded-xl text-sm
                             focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Total Tickets and Price */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Total Tickets *
                </label>
                <input
                  type="number"
                  placeholder="e.g. 100"
                  value={totalTickets}
                  onChange={(e) => setTotalTickets(e.target.value)}
                  min="1"
                  className="w-full border border-gray-300 px-4 py-3 rounded-xl text-sm
                             focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Price (PKR) *
                </label>
                <input
                  type="number"
                  placeholder="e.g. 1500"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  min="0"
                  className="w-full border border-gray-300 px-4 py-3 rounded-xl text-sm
                             focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Event Image URL (optional)
              </label>
              <input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full border border-gray-300 px-4 py-3 rounded-xl text-sm
                           focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
           
            </div>

            {/* Preview Summary */}
            {name && totalTickets && price && (
              <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-emerald-800 mb-2">📊 Event Summary:</p>
                <div className="text-sm text-emerald-700 space-y-1">
                  <p><strong>Event:</strong> {name}</p>
                  <p><strong>Tickets:</strong> {totalTickets} available</p>
                  <p><strong>Price:</strong> PKR {price} per ticket</p>
                  <p><strong>Total Revenue:</strong> PKR {(totalTickets * price).toLocaleString()}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg
                         hover:bg-emerald-700 transition-all active:scale-95 shadow-lg
                         disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating Event...
                </span>
              ) : (
                " Create Event"
              )}
            </button>

            {/* Cancel Button */}
            <button
              type="button"
              onClick={() => navigate("/events")}
              className="w-full bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold
                         hover:bg-gray-300 transition-all active:scale-95"
            >
              Cancel
            </button>
          </form>
        </div>
      </div>

      
    </div>
  );
}

export default CreateEvent;