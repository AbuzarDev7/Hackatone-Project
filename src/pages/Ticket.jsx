import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import QRCode from "react-qr-code"; 

import { db } from "../firebase/firebaseconfig/firebase";

function Ticket() {
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const ticketRef = doc(db, "tickets", ticketId);
        const ticketSnap = await getDoc(ticketRef);

        if (ticketSnap.exists()) {
          setTicket({ id: ticketSnap.id, ...ticketSnap.data() });
        }
      } catch (err) {
        console.error("Error fetching ticket:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTicket();
  }, [ticketId]);

  if (loading)
    return <p className="p-6 text-center text-gray-600 text-lg">Loading ticket...</p>;

  if (!ticket)
    return <p className="p-6 text-center text-gray-600 text-lg">Ticket not found.</p>;

  const qrValue = JSON.stringify({
    ticketId: ticket.id,
    eventId: ticket.eventId,
    email: ticket.email,
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-3">{ticket.eventName}</h1>
        <p className="text-gray-600 text-lg mb-1">Date: {ticket.eventDate}</p>
        <p className="text-gray-700 font-medium mb-1">Ticket ID: {ticket.id}</p>
        <p className="text-gray-700 font-medium mb-4">Status: {ticket.status}</p>

        {/* QR Code Component */}
        <div className="flex justify-center mb-4 bg-white p-2 rounded-xl shadow">
          <QRCode value={qrValue} size={220} />
        </div>

        <p className="text-gray-500 text-sm">
          Show this QR code at the event entrance for entry.
        </p>
      </div>
    </div>
  );
}

export default Ticket;
