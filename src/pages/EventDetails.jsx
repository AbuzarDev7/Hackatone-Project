import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  increment,
} from "firebase/firestore";
import { db } from "../firebase/firebaseconfig/firebase";
import { useSelector } from "react-redux";

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  // 🔹 Fetch Event
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventRef = doc(db, "events", id);
        const eventSnap = await getDoc(eventRef);

        if (eventSnap.exists()) {
          setEvent({
            id: eventSnap.id,
            ...eventSnap.data(),
          });
        }
      } catch (error) {
        console.error("Error fetching event:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  // 🔹 Handle Booking
  const handleBookTicket = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!event) return;

    const ticketsLeft = event.totalTickets - (event.sold || 0);
    if (ticketsLeft <= 0) {
      alert("Tickets are sold out!");
      return;
    }

    try {
      setBooking(true);

      const ticketsRef = collection(db, "tickets");

      // 🔥 Check if user already booked 2 tickets
      const q = query(
        ticketsRef,
        where("email", "==", user.email.toLowerCase()),
        where("eventId", "==", event.id)
      );

      const snapshot = await getDocs(q);

      if (snapshot.size >= 2) {
        alert("⚠ You can book maximum 2 tickets only!");
        setBooking(false);
        return;
      }

      const ticketId = `TICKET-${Date.now()}`;

      //  Add Ticket
      await addDoc(ticketsRef, {
        ticketId,
        eventId: event.id,
        eventName: event.name,
        email: user.email.toLowerCase(),
        status: "valid",
        createdAt: new Date(),
      });

      // Update sold count
      const eventRef = doc(db, "events", event.id);
      await updateDoc(eventRef, {
        sold: increment(1),
      });

      setEvent((prev) => ({
        ...prev,
        sold: (prev.sold || 0) + 1,
      }));

      alert("🎉 Ticket Booked Successfully!");
    } catch (error) {
      console.error("Booking error:", error);
      alert("Booking failed!");
    } finally {
      setBooking(false);
    }
  };

  if (loading)
    return (
      <p className="text-center mt-10 text-gray-500 text-lg">
        Loading event...
      </p>
    );

  if (!event)
    return (
      <p className="text-center mt-10 text-gray-500 text-lg">
        Event not found
      </p>
    );

  const ticketsLeft = event.totalTickets - (event.sold || 0);

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 bg-gray-50 rounded-3xl shadow-lg">
      {/* Event Image */}
      <img
        src={event.imageUrl || "/placeholder.jpg"}
        alt={event.name}
        className="w-full h-72 md:h-96 object-cover rounded-3xl shadow-md"
      />

      <div className="mt-6 md:mt-8 space-y-4">
        {/* Event Name */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
          {event.name}
        </h1>

        {/* Location & Price */}
        <div className="flex flex-col md:flex-row gap-6 text-gray-700">
          <p>
            <strong>Location:</strong> {event.location || "N/A"}
          </p>
          <p>
            <strong>Price:</strong> PKR {event.price?.toLocaleString() || "N/A"}
          </p>
        </div>

        {/* Dates */}
        <p className="text-gray-600">
          <strong>Date:</strong> {event.startDate} - {event.endDate}
        </p>

        {/* Tickets Info */}
        <div className="flex gap-6 text-gray-700">
          <p>
            <strong>Total Tickets:</strong> {event.totalTickets}
          </p>
          <p>
            <strong>Tickets Sold:</strong> {event.sold || 0}
          </p>
          <p>
            <strong>Tickets Left:</strong>{" "}
            <span
              className={
                ticketsLeft <= 0
                  ? "text-red-500 font-semibold"
                  : "text-green-600 font-semibold"
              }
            >
              {ticketsLeft}
            </span>
          </p>
        </div>

        {/* Book Ticket Button */}
        <button
          onClick={handleBookTicket}
          disabled={booking || ticketsLeft <= 0}
          className={`mt-6 w-full md:w-1/3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition ${
            booking || ticketsLeft <= 0
              ? "opacity-60 cursor-not-allowed"
              : ""
          }`}
        >
          {ticketsLeft <= 0
            ? "Sold Out"
            : booking
            ? "Booking..."
            : "Book Ticket"}
        </button>
      </div>
    </div>
  );
}

export default EventDetails;
