import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import QRCode from "react-qr-code"; 
import { db } from "../firebase/firebaseconfig/firebase";

function TicketQr() {
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!ticketId) {
      setError("Ticket ID missing!");
      setLoading(false);
      return;
    }

    const ticketRef = doc(db, "tickets", ticketId);
    
    // Real-time listener for status updates
    const unsubscribe = onSnapshot(
      ticketRef, 
      (ticketSnap) => {
        if (ticketSnap.exists()) {
          const ticketData = { id: ticketSnap.id, ...ticketSnap.data() };
          console.log("✅ Ticket updated:", ticketData); // Debug log
          setTicket(ticketData);
          setError(null);
        } else {
          setError("Ticket not found");
          setTicket(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error("❌ Firebase error:", err);
        setError("Failed to load ticket");
        setLoading(false);
      }
    );

    return () => {
      console.log("🔌 Unsubscribing from ticket updates");
      unsubscribe();
    };
  }, [ticketId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-semibold">Loading ticket...</p>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-gray-100 px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600 text-lg">{error || "Ticket not found"}</p>
        </div>
      </div>
    );
  }

  const qrValue = JSON.stringify({
    ticketId: ticket.id,
    eventId: ticket.eventId,
    email: ticket.email,
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-gray-100 px-4 py-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Status Header - Real-time update hoga */}
        <div className={`py-6 px-8 text-center text-white font-bold text-2xl transition-all duration-500 ${
          ticket.status === "checked" 
            ? "bg-gradient-to-r from-green-500 to-green-600" 
            : "bg-gradient-to-r from-emerald-500 to-emerald-600"
        }`}>
          {ticket.status === "checked" ? "✅ CHECKED IN" : "🎫 BOOKED"}
        </div>

        {/* Ticket Details */}
        <div className="p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {ticket.eventName}
          </h1>
          <p className="text-gray-600 text-lg mb-4">
            📅 {ticket.eventDate}
          </p>

          {/* QR Code */}
          <div className="flex justify-center mb-6 bg-white p-4 rounded-2xl shadow-lg border-4 border-gray-100">
            <QRCode value={qrValue} size={240} level="H" />
          </div>

          {/* Ticket Info */}
          <div className="bg-gray-50 rounded-2xl p-6 space-y-3 text-left">
            <div>
              <p className="text-sm text-gray-500 font-medium">Ticket ID</p>
              <p className="text-lg font-bold text-gray-800 break-all">{ticket.id}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 font-medium">Status</p>
              <p className={`text-lg font-bold transition-colors duration-300 ${
                ticket.status === "checked" ? "text-green-600" : "text-emerald-600"
              }`}>
                {ticket.status === "checked" ? "✓ Checked In" : "⏳ Pending Check-in"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500 font-medium">Email</p>
              <p className="text-lg font-medium text-gray-700 break-all">{ticket.email}</p>
            </div>

            {ticket.checkedAt && (
              <div className="animate-fadeIn">
                <p className="text-sm text-gray-500 font-medium">Checked In At</p>
                <p className="text-lg font-medium text-gray-700">
                  {new Date(ticket.checkedAt).toLocaleString('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  })}
                </p>
              </div>
            )}
          </div>

          {/* Footer Message */}
          <div className={`mt-6 p-4 rounded-xl transition-all duration-500 ${
            ticket.status === "checked" 
              ? "bg-green-50 border-2 border-green-200" 
              : "bg-emerald-50 border-2 border-emerald-200"
          }`}>
            <p className={`font-semibold ${
              ticket.status === "checked" ? "text-green-700" : "text-emerald-700"
            }`}>
              {ticket.status === "checked" 
                ? "🎉 You're all set! Enjoy the event." 
                : "📱 Show this QR code at the entrance for check-in."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TicketQr;