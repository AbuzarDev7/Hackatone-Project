import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebaseconfig/firebase";
import { Link } from "react-router-dom";

function MyTickets() {
  const user = useSelector((state) => state.auth.user);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchTickets = async () => {
      setLoading(true);
      try {
        const ticketsRef = collection(db, "tickets");
        const userEmail = user.email.trim().toLowerCase();
        const q = query(ticketsRef, where("email", "==", userEmail));
        const querySnapshot = await getDocs(q);

        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTickets(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [user]);

  if (loading) return <p className="p-6 text-center text-gray-500 text-lg">Loading your tickets...</p>;
  if (!tickets.length) return <p className="p-6 text-center text-gray-500 text-lg">You have no tickets yet.</p>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">My Tickets</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            className="bg-white p-6 rounded-2xl shadow-lg flex flex-col justify-between hover:shadow-2xl transition"
          >
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-800">{ticket.eventName}</h2>
              <p className="text-gray-500 mt-1 text-sm md:text-base">
                <strong>Date:</strong> {ticket.eventDate}
              </p>
              <p className={`mt-2 text-sm md:text-base font-semibold ${
                ticket.status === "Booked" ? "text-emerald-600" : "text-red-500"
              }`}>
                Status: {ticket.status}
              </p>
            </div>
            <Link
              to={`/ticket/${ticket.id}`}
              className="mt-auto inline-block w-full text-center bg-emerald-600 text-white py-2.5 rounded-xl font-semibold hover:bg-emerald-700 transition shadow-lg active:scale-95"
            >
              View Ticket
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyTickets;
