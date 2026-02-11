
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { collection, getDocs, doc, getDoc, updateDoc } from "firebase/firestore";
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

  // Fetch organizer name
  useEffect(() => {
    const fetchOrganizerName = async () => {
      if (!user?.uid) return;
      try {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) setOrganizerName(snap.data().name);
      } catch (err) {
        console.error("Error fetching organizer name:", err);
      }
    };
    fetchOrganizerName();
  }, [user]);

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const ref = collection(db, "events");
        const snapshot = await getDocs(ref);
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setEvents(data);
      } catch (err) {
        console.error("Error fetching events:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Fetch attendees
  const fetchAttendees = async (event) => {
    setSelectedEvent(event);
    setAttendeeLoading(true);
    setShowValidate(false);
    try {
      const ref = collection(db, "events", event.id, "attendees");
      const snapshot = await getDocs(ref);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        eventId: event.id,
        eventName: event.name,
        ...doc.data(),
      }));
      setAttendees(data);
    } catch (err) {
      console.error("Error fetching attendees:", err);
    } finally {
      setAttendeeLoading(false);
    }
  };

  const handleValidate = async (att) => {
    try {
      const attendeeRef = doc(db, "events", att.eventId, "attendees", att.id);
      await updateDoc(attendeeRef, { status: "Used" });
      setAttendees((prev) =>
        prev.map((a) => (a.id === att.id ? { ...a, status: "Used" } : a))
      );
    } catch (err) {
      console.error("Failed to validate ticket:", err);
      alert("Ticket validation failed!");
    }
  };

  const filteredAttendees = attendees.filter(
    (att) =>
      att.name.toLowerCase().includes(search.toLowerCase()) ||
      att.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading)
    return (
      <p className="p-6 text-gray-600 text-center text-lg">Loading dashboard...</p>
    );

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-10">

      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
          Organizer Dashboard
        </h1>
        <p className="text-gray-600 mt-1">
          Welcome, <span className="font-semibold">{organizerName || user?.email}</span>
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-1">
          <p className="text-sm text-gray-500 font-semibold">Total Events</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{events.length}</p>
          <p className="text-gray-400 mt-1">All events created</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-1">
          <p className="text-sm text-gray-500 font-semibold">Tickets Sold</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{events.reduce((sum, e) => sum + (e.sold || 0), 0)}</p>
          <p className="text-gray-400 mt-1">Tickets sold across events</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-1">
          <p className="text-sm text-gray-500 font-semibold">Sold Out Events</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{events.filter((e) => e.sold >= e.totalTickets).length}</p>
          <p className="text-gray-400 mt-1">Events with all tickets sold</p>
        </div>
      </div>

      {/* Event Cards */}
      <h2 className="text-2xl md:text-3xl font-semibold mb-6">Events</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div key={event.id} className="bg-white rounded-3xl shadow-2xl hover:shadow-3xl transition overflow-hidden transform hover:-translate-y-2">
            {event.imageUrl ? (
              <img src={event.imageUrl} alt={event.name} className="h-52 w-full object-cover" />
            ) : (
              <div className="h-52 w-full bg-gray-200 flex items-center justify-center text-gray-400">
                No Image
              </div>
            )}
            <div className="p-5">
              <h3 className="text-xl font-bold text-gray-800">{event.name}</h3>
              <p className="text-gray-500 mt-1">Date: {event.startDate} - {event.endDate}</p>
              <p className="text-gray-500 mt-1">Tickets Sold: {event.sold}/{event.totalTickets}</p>
              {event.sold >= event.totalTickets && (
                <span className="inline-block mt-2 text-xs bg-red-100 text-red-600 px-3 py-1 rounded-full">
                  Sold Out
                </span>
              )}
              <div className="mt-4 flex gap-2 flex-wrap">
                <button
                  onClick={() => fetchAttendees(event)}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition font-semibold"
                >
                  View Attendees
                </button>
                <button
                  onClick={() => { fetchAttendees(event); setShowValidate(true); }}
                  className="flex-1 bg-green-600 text-white py-2 rounded-xl hover:bg-green-700 transition font-semibold"
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
          <h2 className="text-2xl font-bold mb-4">{showValidate ? "Validate Tickets" : "Attendees"} — {selectedEvent.name}</h2>

          {attendeeLoading ? (
            <p className="text-gray-600">Loading attendees...</p>
          ) : attendees.length === 0 ? (
            <p className="text-gray-500">No attendees yet.</p>
          ) : (
            <div>
              {/* Green Search Bar */}
              {showValidate && (
                <input
                  type="text"
                  placeholder="Search by name or email"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full max-w-md mb-4 p-3 rounded-full border border-green-400 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-md placeholder-gray-400 transition"
                />
              )}

              {/* Table */}
              <div className="overflow-x-auto rounded-2xl shadow-inner border border-gray-200 bg-white">
                <table className="w-full table-auto border-collapse">
                  <thead className="bg-green-100 rounded-t-2xl">
                    <tr>
                      <th className="p-3 text-left font-medium text-gray-700">Name</th>
                      <th className="p-3 text-left font-medium text-gray-700">Email</th>
                      <th className="p-3 text-left font-medium text-gray-700">Ticket ID</th>
                      <th className="p-3 text-left font-medium text-gray-700">Status</th>
                      {showValidate && <th className="p-3 text-left font-medium text-gray-700">Action</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAttendees.map((att) => (
                      <tr key={att.id} className="border-b hover:bg-green-50 transition">
                        <td className="p-3">{att.name}</td>
                        <td className="p-3">{att.email}</td>
                        <td className="p-3">{att.id}</td>
                        <td className="p-3">
                          <span className={`px-3 py-1 rounded-full text-xs ${att.status === "Used" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
                            {att.status || "Booked"}
                          </span>
                        </td>
                        {showValidate && (
                          <td className="p-3">
                            {att.status === "Booked" ? (
                              <button
                                onClick={() => handleValidate(att)}
                                className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition font-semibold"
                              >
                                Validate
                              </button>
                            ) : (
                              <span className="text-green-600 font-semibold">Validated</span>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
