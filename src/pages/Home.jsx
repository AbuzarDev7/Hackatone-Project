import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebaseconfig/firebase";
import { Link } from "react-router-dom";

function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "events"));
        const eventsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEvents(eventsData);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <p className="text-center mt-10 text-gray-500 text-lg">Loading events...</p>
    );
  }

  return (
    <div className="p-6 md:p-10">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-gray-800">Upcoming Events</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {events.map((event) => {
          const ticketsLeft = event.totalTickets - event.sold;

          return (
            <div
              key={event.id}
              className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition overflow-hidden"
            >
              {event.imageUrl ? (
                <img
                  src={event.imageUrl}
                  alt={event.name}
                  className="w-full h-56 object-cover rounded-t-3xl"
                />
              ) : (
                <div className="w-full h-56 bg-gray-200 flex items-center justify-center text-gray-400 rounded-t-3xl">
                  No Image
                </div>
              )}

              <div className="p-5">
                <h2 className="text-xl font-bold text-gray-800">{event.name}</h2>
                <p className="text-gray-500 mt-1">
                  Date: {event.startDate} - {event.endDate}
                </p>

                <p className="mt-2 text-sm">
                  Tickets Left:{" "}
                  <span className={ticketsLeft === 0 ? "text-red-500 font-semibold" : "text-green-600 font-semibold"}>
                    {ticketsLeft}
                  </span>
                </p>

                <Link
                  to={`/events/${event.id}`}
                  className="inline-block mt-4 w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl transition shadow"
                >
                  View Details
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Home;
