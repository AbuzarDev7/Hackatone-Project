import React, { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig/firebase";

function ScanTicket() {
  const [scanning, setScanning] = useState(false);
  const [ticketData, setTicketData] = useState(null);
  const [error, setError] = useState("");
  const [cameraPermission, setCameraPermission] = useState(null);
  const html5QrRef = useRef(null);

  useEffect(() => {
    checkCameraPermission();
  }, []);

  const checkCameraPermission = async () => {
    try {
      if (navigator.permissions && navigator.permissions.query) {
        const permission = await navigator.permissions.query({ name: "camera" });
        setCameraPermission(permission.state);
        permission.onchange = () => setCameraPermission(permission.state);
      }
    } catch {
      console.log("Permission API not supported");
    }
  };

  const requestCameraAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      stream.getTracks().forEach((track) => track.stop());
      setCameraPermission("granted");
      return true;
    } catch {
      setCameraPermission("denied");
      setError("Camera permission denied. Enable camera in browser settings.");
      return false;
    }
  };

  const startScanner = async () => {
    if (cameraPermission !== "granted") {
      const hasAccess = await requestCameraAccess();
      if (!hasAccess) return;
    }

    setScanning(true);
    setTicketData(null);
    setError("");

    setTimeout(() => {
      if (!html5QrRef.current) html5QrRef.current = new Html5Qrcode("qr-reader");

      html5QrRef.current
        .start(
          { facingMode: "environment" },
          { fps: 10, qrbox: 250 },
          async (decodedText) => {
            try {
              await html5QrRef.current.stop();
            } catch {}
            setScanning(false);

            try {
              const { ticketId } = JSON.parse(decodedText);
              if (!ticketId) { setError("Invalid QR Code!"); return; }

              const ticketRef = doc(db, "tickets", ticketId);
              const ticketSnap = await getDoc(ticketRef);
              if (!ticketSnap.exists()) { setError("Ticket Not Found!"); return; }

              const ticket = { id: ticketSnap.id, ...ticketSnap.data() };
              setTicketData(ticket);

              if (ticket.status === "checked") { setError("Ticket Already Checked In!"); return; }

              await updateDoc(ticketRef, { status: "checked", checkedAt: new Date().toISOString() });
              setTicketData({ ...ticket, status: "checked", checkedAt: new Date().toISOString() });

            } catch {
              setError("Invalid QR Code Format!");
            }
          },
          (err) => {}
        )
        .catch((err) => {
          setError("Unable to start camera: " + err.message);
          setScanning(false);
        });
    }, 200);
  };

  const stopScanner = async () => {
    if (html5QrRef.current) {
      try { await html5QrRef.current.stop(); } catch {}
    }
    setScanning(false);
  };

  const resetScanner = () => {
    setTicketData(null);
    setError("");
    setScanning(false);
    if (html5QrRef.current) {
      html5QrRef.current.stop();
      html5QrRef.current = null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-gray-100 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-6 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Ticket Scanner</h1>
          <p className="text-gray-600">Scan attendee QR codes to check them in</p>

          {cameraPermission && (
            <div className={`mt-4 px-4 py-2 rounded-lg inline-block ${
              cameraPermission === "granted" ? "bg-green-100 text-green-700" :
              cameraPermission === "denied" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
            }`}>
              📷 Camera: {cameraPermission === "granted" ? "✓ Allowed" : cameraPermission === "denied" ? "✗ Blocked" : "Not requested"}
            </div>
          )}
        </div>

        {!scanning && !ticketData && cameraPermission !== "denied" && (
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
            <button onClick={startScanner} className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition">
              📷 Start Scanning
            </button>
          </div>
        )}

        {scanning && (
          <div className="bg-white rounded-3xl shadow-xl p-6">
            <div className="mb-4 text-center">
              <div className="inline-flex items-center space-x-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="font-semibold">Camera Active - Point at QR Code</span>
              </div>
            </div>
            <div id="qr-reader" className="w-full rounded-2xl overflow-hidden"></div>
            <button onClick={stopScanner} className="mt-4 w-full bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600 transition">
              Cancel Scanning
            </button>
          </div>
        )}

        {ticketData && (
          <div className="bg-white rounded-3xl shadow-xl p-8 space-y-4">
            <div className="text-center py-4 px-6 rounded-2xl text-white text-2xl font-bold bg-green-500">CHECK-IN SUCCESSFUL</div>
            <div className="bg-gray-50 rounded-2xl p-6 space-y-2">
              <p><strong>Event:</strong> {ticketData.eventName}</p>
              <p><strong>Email:</strong> {ticketData.email}</p>
              <p><strong>Ticket ID:</strong> {ticketData.id}</p>
              <p><strong>Date:</strong> {ticketData.eventDate}</p>
              <p className="text-green-700 font-bold">Checked In At: {new Date(ticketData.checkedAt).toLocaleString()}</p>
            </div>
            <button onClick={resetScanner} className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition">
              🔄 Scan Next Ticket
            </button>
          </div>
        )}

        {error && !scanning && (
          <div className="bg-red-100 border-2 border-red-500 rounded-2xl p-6 mt-4 text-center">
            <p>{error}</p>
            <button onClick={resetScanner} className="mt-4 w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition">
               Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ScanTicket;
