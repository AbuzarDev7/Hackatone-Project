// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebaseconfig/firebase";

function Dashboard() {
  const user = useSelector((state) => state.auth.user); // Redux se user
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Firebase se events fetch
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const eventsCol = collection(db, "events");
        const snapshot = await getDocs(eventsCol);
        const data = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => new Date(a.date) - new Date(b.date));
        setEvents(data);
      } catch (err) {
        console.error("Error fetching events:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  if (loading) return <p className="p-6">Loading events...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        {user && (
          <p className="text-gray-600 mt-1 text-lg">
            Welcome, <span className="font-semibold">{user.name || user.displayName}</span>
          </p>
        )}
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-gray-500 text-sm">Total Events</h2>
          <p className="text-2xl font-bold">{events.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-gray-500 text-sm">Tickets Sold</h2>
          <p className="text-2xl font-bold">{events.reduce((sum, e) => sum + e.sold, 0)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-gray-500 text-sm">Sold Out Events</h2>
          <p className="text-2xl font-bold">{events.filter((e) => e.sold >= e.totalTickets).length}</p>
        </div>
      </div>

      {/* Create Event */}
      <div className="mb-6">
        <Link
          to="/create-event"
          className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
        >
          + Create New Event
        </Link>
      </div>

      {/* Event List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div
            key={event.id}
            className="relative bg-white rounded-lg shadow overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-2xl"
          >
            {/* Sold Out Badge */}
            {event.sold >= event.totalTickets && (
              <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs rounded">Sold Out</span>
            )}

            {/* Event Image */}
            {event.imageUrl && (
              <img
                src={event.imageUrl}
                alt={event.name}
                className="w-full h-48 object-cover transition-transform duration-500 hover:scale-110"
              />
            )}

            {/* Event Info */}
            <div className="p-5">
              <h3 className="text-xl font-semibold text-gray-800">{event.name}</h3>
              <p className="text-gray-500 mt-1">Date: {event.date}</p>
              <p className="text-gray-500">Tickets Sold: {event.sold}/{event.totalTickets}</p>
              <p className="text-gray-500">Remaining Tickets: {event.totalTickets - event.sold}</p>

              {/* Action Buttons */}
              <div className="mt-4 flex gap-2">
                <Link
                  to={`/attendees/${event.id}`}
                  className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600 text-center"
                >
                  View Attendees
                </Link>
                <Link
                  to="/validate-ticket"
                  className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 text-center"
                >
                  Validate Tickets
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
