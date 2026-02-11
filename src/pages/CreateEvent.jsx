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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !location || !startDate || !endDate || !totalTickets || !price) {
      alert("Please fill all required fields!");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "events"), {
        name,
        location,
        startDate,
        endDate,
        totalTickets: Number(totalTickets),
        price: Number(price),
        sold: 0,
        imageUrl: imageUrl || "",
        createdAt: new Date().toISOString(),
      });

      alert("Event created successfully!");
      navigate("/dashboard");
    } catch (err) {
      console.error("Error creating event:", err);
      alert("Failed to create event!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">

        {/* LEFT PANEL */}
        <div className="hidden md:flex md:w-1/2 flex-col justify-center px-10 py-12 bg-gray-900 text-white">
          <h2 className="text-4xl font-bold leading-tight">
            Create Your Next <span className="text-emerald-400 block">Amazing Event</span>
          </h2>
          <p className="mt-6 text-gray-300 text-sm leading-relaxed max-w-sm">
            Add event details, set dates, manage tickets, and start selling. Everything you need in one simple dashboard.
          </p>
          <ul className="mt-6 space-y-2 text-gray-300 text-sm">
            <li>✔ Set event location</li>
            <li>✔ Set start & end dates</li>
            <li>✔ Set ticket price</li>
            <li>✔ Manage ticket limits</li>
            <li>✔ Upload event image</li>
            <li>✔ Track sales in dashboard</li>
          </ul>
        </div>

        {/* RIGHT FORM */}
        <div className="w-full md:w-1/2 px-8 py-10 flex flex-col justify-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Event Details</h3>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Event Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Event Name</label>
              <input
                type="text"
                placeholder="Enter event name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 w-full border border-gray-300 px-4 py-3 rounded-xl text-sm
                           focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <input
                type="text"
                placeholder="Enter event location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="mt-2 w-full border border-gray-300 px-4 py-3 rounded-xl text-sm
                           focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-2 w-full border border-gray-300 px-4 py-3 rounded-xl text-sm
                             focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-2 w-full border border-gray-300 px-4 py-3 rounded-xl text-sm
                             focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            {/* Total Tickets and Price */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Total Tickets</label>
                <input
                  type="number"
                  placeholder="Enter total tickets"
                  value={totalTickets}
                  onChange={(e) => setTotalTickets(e.target.value)}
                  className="mt-2 w-full border border-gray-300 px-4 py-3 rounded-xl text-sm
                             focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Price (PKR)</label>
                <input
                  type="number"
                  placeholder="Enter ticket price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="mt-2 w-full border border-gray-300 px-4 py-3 rounded-xl text-sm
                             focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Event Image URL (optional)</label>
              <input
                type="text"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="mt-2 w-full border border-gray-300 px-4 py-3 rounded-xl text-sm
                           focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold
                         hover:bg-emerald-700 transition active:scale-95 shadow-lg"
            >
              {loading ? "Creating Event..." : "Create Event"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateEvent;