import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase/firebaseconfig/firebase";

function Dashboard() {
  const user = useSelector((state) => state.auth.user);

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [attendeeLoading, setAttendeeLoading] = useState(false);
  const [organizerName, setOrganizerName] = useState("");
  const [showValidate, setShowValidate] = useState(false);
  const [search, setSearch] = useState("");

  //  Fetch Organizer Name
  useEffect(() => {
    if (!user?.uid) return;

    const fetchOrganizerName = async () => {
      try {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) setOrganizerName(snap.data().name);
      } catch (err) {
        console.error(err);
      }
    };

    fetchOrganizerName();
  }, [user]);

  //  Fetch Events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const ref = collection(db, "events");
        const snapshot = await getDocs(ref);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEvents(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);


  const fetchAttendees = async (event, validate = false) => {
    setSelectedEvent(event);
    setShowValidate(validate);
    setAttendeeLoading(true);

    try {
      const q = query(
        collection(db, "tickets"),
        where("eventId", "==", event.id)
      );

      const snapshot = await getDocs(q);

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setAttendees(data);
    } catch (err) {
      console.error("Error fetching attendees:", err);
    } finally {
      setAttendeeLoading(false);
    }
  };

  // Validate Ticket
  const handleValidate = async (ticket) => {
    try {
      const ticketRef = doc(db, "tickets", ticket.id);
      await updateDoc(ticketRef, { status: "Used" });

      setAttendees((prev) =>
        prev.map((t) =>
          t.id === ticket.id ? { ...t, status: "Used" } : t
        )
      );
    } catch (err) {
      console.error(err);
      alert("Validation failed");
    }
  };

  const filteredAttendees = attendees.filter(
    (att) =>
      att.name?.toLowerCase().includes(search.toLowerCase()) ||
      att.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading)
    return (
      <p className="p-6 text-gray-600 text-center text-lg">
        Loading dashboard...
      </p>
    );

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-10">

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
          Organizer Dashboard
        </h1>
        <p className="text-gray-600 mt-1">
          Welcome,{" "}
          <span className="font-semibold">
            {organizerName || user?.email}
          </span>
        </p>
      </div>

      {/* Stats Cards (Old UI Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <p className="text-sm text-gray-500 font-semibold">Total Events</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">
            {events.length}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <p className="text-sm text-gray-500 font-semibold">
            Tickets Sold
          </p>
          <p className="text-3xl font-bold text-gray-800 mt-2">
            {events.reduce((sum, e) => sum + (e.sold || 0), 0)}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <p className="text-sm text-gray-500 font-semibold">
            Sold Out Events
          </p>
          <p className="text-3xl font-bold text-gray-800 mt-2">
            {events.filter((e) => e.sold >= e.totalTickets).length}
          </p>
        </div>
      </div>

      {/* Event Cards (Old UI Style) */}
      <h2 className="text-2xl md:text-3xl font-semibold mb-6">
        Events
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div
            key={event.id}
            className="bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            {event.imageUrl ? (
              <img
                src={event.imageUrl}
                alt={event.name}
                className="h-52 w-full object-cover"
              />
            ) : (
              <div className="h-52 w-full bg-gray-200 flex items-center justify-center text-gray-400">
                No Image
              </div>
            )}

            <div className="p-5">
              <h3 className="text-xl font-bold text-gray-800">
                {event.name}
              </h3>

              <div className="mt-4 flex gap-2 flex-wrap">
                <button
                  onClick={() => fetchAttendees(event, false)}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition"
                >
                  View Attendees
                </button>

                <button
                  onClick={() => fetchAttendees(event, true)}
                  className="flex-1 bg-green-600 text-white py-2 rounded-xl hover:bg-green-700 transition"
                >
                  Validate Tickets
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Attendees Section */}
      {selectedEvent && (
        <div className="mt-12 bg-gray-50 p-6 rounded-3xl shadow-2xl">
          <h2 className="text-2xl font-bold mb-4">
            {showValidate ? "Validate Tickets" : "Attendees"} — {selectedEvent.name}
          </h2>

          {showValidate && (
            <input
              type="text"
              placeholder="Search by name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border p-3 rounded-xl w-full max-w-sm mb-4"
            />
          )}

          {attendeeLoading ? (
            <p>Loading attendees...</p>
          ) : (
            <div className="overflow-x-auto bg-white rounded-2xl">
              <table className="w-full table-auto">
                <thead className="bg-green-100">
                  <tr>
                    <th className="p-3 text-left">Name</th>
                    <th className="p-3 text-left">Email</th>
                    <th className="p-3 text-left">Ticket ID</th>
                    <th className="p-3 text-left">Status</th>
                    {showValidate && <th className="p-3">Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredAttendees.map((att) => (
                    <tr key={att.id} className="border-b hover:bg-green-50">
                      <td className="p-3">{att.name}</td>
                      <td className="p-3">{att.email}</td>
                      <td className="p-3">{att.id}</td>
                      <td className="p-3">
                        {att.status || "Booked"}
                      </td>
                      {showValidate && (
                        <td className="p-3">
                          {att.status !== "Used" ? (
                            <button
                              onClick={() => handleValidate(att)}
                              className="bg-blue-500 text-white px-3 py-1 rounded-xl"
                            >
                              Validate
                            </button>
                          ) : (
                            <span className="text-green-600 font-semibold">
                              Validated
                            </span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
