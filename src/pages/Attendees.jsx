import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebaseconfig/firebase";

function Attendees() {
  const { eventId } = useParams(); // URL se event ID
  const user = useSelector((state) => state.auth.user); // Redux se logged-in user
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchAttendees = async () => {
      setLoading(true);
      try {
        const attendeesCol = collection(db, "events", eventId, "attendees");
        const snapshot = await getDocs(attendeesCol);
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        setAttendees(data);

        // Agar attendee login hai, sirf uska email show kare
        if (user.role === "attendee") {
          setSearch(user.email);
        }

      } catch (err) {
        console.error("Error fetching attendees:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendees();
  }, [eventId, user]);

  // Filter logic
  const filteredAttendees =
    user.role === "attendee"
      ? attendees.filter((att) => att.email === user.email) // attendee: apna ticket
      : attendees.filter(
          (att) =>
            att.name.toLowerCase().includes(search.toLowerCase()) ||
            att.email.toLowerCase().includes(search.toLowerCase())
        ); // organizer: search by name/email

  if (loading) return <p className="p-6">Loading attendees...</p>;

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <h1 className="text-2xl font-bold mb-4">Attendees</h1>

      {user.role === "organizer" && (
        <input
          type="text"
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-full max-w-sm mb-4"
        />
      )}

      {filteredAttendees.length === 0 ? (
        <p>No attendees found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-lg shadow">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Ticket ID</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendees.map((att) => (
                <tr key={att.id} className="border-b">
                  <td className="p-3">{att.name}</td>
                  <td className="p-3">{att.email}</td>
                  <td className="p-3">{att.id}</td>
                  <td className="p-3">{att.status || "Booked"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Attendees;
