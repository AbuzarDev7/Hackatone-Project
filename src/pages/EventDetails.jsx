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

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventRef = doc(db, "events", id);
        const eventSnap = await getDoc(eventRef);
        if (eventSnap.exists()) {
          setEvent({ id: eventSnap.id, ...eventSnap.data() });
        }
      } catch (error) {
        console.error("Error fetching event:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleBookTicket = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (event.sold >= event.totalTickets) {
      alert("Sorry, tickets are sold out!");
      return;
    }

    try {
      setBooking(true);

      const ticketsRef = collection(db, "tickets");
      const q = query(
        ticketsRef,
        where("email", "==", user.email.trim().toLowerCase()),
        where("eventId", "==", event.id)
      );
      const snapshot = await getDocs(q);

      if (snapshot.docs.length >= 2) {
        alert("You can book a maximum of 2 tickets for this event!");
        setBooking(false);
        return;
      }

      await addDoc(ticketsRef, {
        eventId: event.id,
        eventName: event.name,
        eventDate: event.date,
        email: user.email.trim().toLowerCase(),
        status: "Booked",
        createdAt: new Date().toISOString(),
      });

      const eventRef = doc(db, "events", event.id);
      await updateDoc(eventRef, { sold: event.sold + 1 });

      alert("🎉 Ticket booked successfully!");
      setEvent((prev) => ({ ...prev, sold: prev.sold + 1 }));
    } catch (err) {
      console.error("Booking failed:", err);
      alert("Booking failed");
    } finally {
      setBooking(false);
    }
  };

  if (loading)
    return <p className="text-center mt-10 text-gray-500 text-lg">Loading event...</p>;
  if (!event)
    return <p className="text-center mt-10 text-gray-500 text-lg">Event not found</p>;

  const ticketsLeft = event.totalTickets - event.sold;

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 bg-gray-50 rounded-3xl shadow-lg">
      <img
        src={event.imageUrl}
        alt={event.name}
        className="w-full h-72 md:h-96 object-cover rounded-3xl shadow-md"
      />

      <div className="mt-6 md:mt-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">{event.name}</h1>
        <p className="text-gray-500 mt-2 md:mt-3 text-sm md:text-base">
          Date: {event.startDate} - {event.endDate}
        </p>

        <div className="mt-4 flex flex-col md:flex-row md:items-center md:gap-6 text-gray-700">
          <p className="text-sm md:text-base">
            Total Tickets: <span className="font-semibold">{event.totalTickets}</span>
          </p>
          <p className="text-sm md:text-base">
            Tickets Left:{" "}
            <span
              className={
                ticketsLeft === 0
                  ? "text-red-500 font-semibold"
                  : "text-emerald-600 font-semibold"
              }
            >
              {ticketsLeft}
            </span>
          </p>
        </div>

        <button
          onClick={handleBookTicket}
          disabled={booking || ticketsLeft === 0}
          className={`mt-6 w-full md:w-1/3 text-center bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition shadow-lg active:scale-95 ${
            booking || ticketsLeft === 0 ? "opacity-60 cursor-not-allowed" : ""
          }`}
        >  
          {ticketsLeft === 0 ? "Sold Out" : booking ? "Booking..." : "Book Ticket"}
        </button>
      </div>
    </div>
  );
}

export default EventDetails;
