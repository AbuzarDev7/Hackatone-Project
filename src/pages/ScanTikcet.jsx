import React, { useState, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseconfig/firebase";

function ScanTicket() {
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [ticketData, setTicketData] = useState(null);
  const [error, setError] = useState("");
  const [scannerInstance, setScannerInstance] = useState(null);
  const [cameraPermission, setCameraPermission] = useState(null); // 'granted', 'denied', 'prompt'

  // Check camera permission on mount
  useEffect(() => {
    checkCameraPermission();
  }, []);

  const checkCameraPermission = async () => {
    try {
      if (navigator.permissions && navigator.permissions.query) {
        const permission = await navigator.permissions.query({ name: 'camera' });
        setCameraPermission(permission.state);
        
        // Listen for permission changes
        permission.onchange = () => {
          setCameraPermission(permission.state);
        };
      }
    } catch (err) {
      console.log("Permission API not supported:", err);
    }
  };

  const requestCameraAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } // Use back camera on mobile
      });
      
      // Stop the stream immediately (we just needed permission)
      stream.getTracks().forEach(track => track.stop());
      
      setCameraPermission('granted');
   
      return true;
    } catch (err) {
      console.error(" Camera access denied:", err);
      setCameraPermission('denied');
      setError(" Camera permission denied. Please enable camera in browser settings.");
      return false;
    }
  };

  const startScanner = async () => {
    // First check/request camera permission
    if (cameraPermission !== 'granted') {
      const hasAccess = await requestCameraAccess();
      if (!hasAccess) return;
    }

    setScanning(true);
    setScanResult(null);
    setTicketData(null);
    setError("");

    // Small delay to ensure DOM is ready
    setTimeout(() => {
      const scanner = new Html5QrcodeScanner("qr-reader", {
        qrbox: { width: 250, height: 250 },
        fps: 10,
        rememberLastUsedCamera: true,
        showTorchButtonIfSupported: true,
        aspectRatio: 4.0,
        disableFlip: false,
        videoConstraints: {
          facingMode: "environment" // Prefer back camera
        }
      });

      setScannerInstance(scanner);

      scanner.render(
        async (decodedText) => {
          console.log("📷 QR Scanned:", decodedText);
          
          // Stop scanner immediately
          try {
            await scanner.clear();
          } catch (err) {
            console.log("Scanner clear error (safe to ignore):", err);
          }
          
          setScanning(false);
          setScanResult(decodedText);

          try {
            // Parse QR data
            const qrData = JSON.parse(decodedText);
            console.log(" Parsed QR Data:", qrData);
            
            const { ticketId } = qrData;

            if (!ticketId){
              setError(" Invalid QR Code - Missing Ticket ID!");
              return;
            }

            // Fetch ticket from Firebase
            const ticketRef = doc(db, "tickets", ticketId);
            const ticketSnap = await getDoc(ticketRef);

            if (!ticketSnap.exists()) {
              console.error(" Ticket not found in database");
              setError(" Invalid Ticket - Not Found!");
              return;
            }

            const ticket = { id: ticketSnap.id, ...ticketSnap.data() };
            console.log("Ticket Data:", ticket);
            setTicketData(ticket);

            // Check if already checked in
            if (ticket.status === "checked") {
              console.warn(" Ticket already checked in");
              setError(" Ticket Already Checked In!");
              return;
            }

            // Update ticket status to "checked"
            console.log(" Updating ticket status to checked...");
            await updateDoc(ticketRef, {
              status: "checked",
              checkedAt: new Date().toISOString(),
            });

            console.log(" Ticket successfully checked in!");
            setTicketData({ ...ticket, status: "checked", checkedAt: new Date().toISOString() });
            
          } catch (err) {
            console.error("Scan error:", err);
            if (err instanceof SyntaxError) {
              setError(" Invalid QR Code Format!");
            } else {
              setError(" Error Processing Ticket!");
            }
          }
        },
        (errorMessage) => {
          // Only log critical errors
          if (errorMessage.includes("NotAllowedError")) {
   
            setError(" Camera permission denied!");
            setScanning(false);
            setCameraPermission('denied');
          } else if (errorMessage.includes("NotFoundError")) {

            setError(" No camera found on device!");
            setScanning(false);
          }
          // Ignore other scanning errors (they're normal during scanning)
        }
      );
    }, 100);
  };

  const resetScanner = () => {
    setScanResult(null);
    setTicketData(null);
    setError("");
    setScannerInstance(null);
  };

  const stopScanner = async () => {
    if (scannerInstance) {
      try {
        await scannerInstance.clear();
      } catch (err) {
        console.log("Scanner cleanup error (safe to ignore):", err);
      }
    }
    setScanning(false);
    setScanResult(null);
    setScannerInstance(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-gray-100 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-6 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
             Ticket Scanner
          </h1>
          <p className="text-gray-600">Scan attendee QR codes to check them in</p>
          
          {/* Camera Permission Status */}
          {cameraPermission && (
            <div className={`mt-4 px-4 py-2 rounded-lg inline-block ${
              cameraPermission === 'granted' 
                ? 'bg-green-100 text-green-700' 
                : cameraPermission === 'denied'
                ? 'bg-red-100 text-red-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              📷 Camera: {cameraPermission === 'granted' ? '✓ Allowed' : cameraPermission === 'denied' ? '✗ Blocked' : ' Not requested'}
            </div>
          )}
        </div>

        {/* Camera Permission Denied Warning */}
        {cameraPermission === 'denied' && !scanning && (
          <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-6 mb-6">
            <h3 className="text-xl font-bold text-red-700 mb-2">📷 Camera Access Required</h3>
            <p className="text-red-600 mb-4">
              To scan QR codes, please allow camera access in your browser settings.
            </p>
            
            <button
              onClick={requestCameraAccess}
              className="mt-4 w-full bg-red-600 text-white py-3 rounded-xl font-semibold
                         hover:bg-red-700 transition"
            >
              🔄 Try Again
            </button>
          </div>
        )}

        {/* Scanner Button */}
        {!scanning && !scanResult && cameraPermission !== 'denied' && (
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
            <button
              onClick={startScanner}
              className="w-full bg-emerald-600 text-white py-4 px-8 rounded-xl font-bold text-lg
                         hover:bg-emerald-700 transition shadow-lg active:scale-95 transform"
            >
              📷 Start Scanning
            </button>
            <p className="text-gray-500 text-sm mt-4">
              {cameraPermission === 'granted' 
                ? 'Camera ready! Click to scan QR codes' 
                : 'Click to activate camera and scan QR codes'}
            </p>
          </div>
        )}

        {/* Scanner Area */}
        {scanning && (
          <div className="bg-white rounded-3xl shadow-xl p-6">
            <div className="mb-4 text-center">
              <div className="inline-flex items-center space-x-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="font-semibold">Camera Active - Point at QR Code</span>
              </div>
            </div>
            
            <div id="qr-reader" className="w-full rounded-2xl overflow-hidden"></div>
            
            <button
              onClick={stopScanner}
              className="mt-4 w-full bg-red-500 text-white py-3 rounded-xl font-semibold
                         hover:bg-red-600 transition active:scale-95 transform"
            >
               Cancel Scanning
            </button>
          </div>
        )}

        {/* Scan Result */}
        {scanResult && (
          <div className="bg-white rounded-3xl shadow-xl p-8">
            {/* Error Message */}
            {error && (
              <div className="bg-red-100 border-2 border-red-500 rounded-2xl p-6 mb-6 text-center animate-shake">
                <p className="text-red-700 text-2xl font-bold">{error}</p>
                {ticketData && (
                  <div className="mt-4 text-left bg-white rounded-xl p-4">
                    <p className="text-sm text-gray-600">Ticket Details:</p>
                    <p className="text-lg font-semibold text-gray-800">{ticketData.eventName}</p>
                    <p className="text-md text-gray-600">{ticketData.email}</p>
                    {ticketData.checkedAt && (
                      <p className="text-sm text-gray-500 mt-2">
                        Previously checked in: {new Date(ticketData.checkedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Success - Ticket Details */}
            {ticketData && !error && (
              <div className="space-y-4">
                {/* Status Badge */}
                <div className="text-center py-4 px-6 rounded-2xl text-white text-2xl font-bold bg-green-500 animate-bounce-once">
                   CHECK-IN SUCCESSFUL
                </div>

                {/* Ticket Info */}
                <div className="bg-gray-50 rounded-2xl p-6 space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Event Name</p>
                    <p className="text-xl font-bold text-gray-800">
                      {ticketData.eventName}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 font-medium">Attendee Email</p>
                    <p className="text-lg font-medium text-gray-700 break-all">
                      {ticketData.email}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 font-medium">Ticket ID</p>
                    <p className="text-lg font-medium text-gray-700 break-all">
                      {ticketData.id}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 font-medium">Event Date</p>
                    <p className="text-lg font-medium text-gray-700">
                       {ticketData.eventDate}
                    </p>
                  </div>

                  <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
                    <p className="text-sm text-green-600 font-medium">✓ Checked In At</p>
                    <p className="text-lg font-bold text-green-700">
                      {new Date(ticketData.checkedAt).toLocaleString('en-US', {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      })}
                    </p>
                  </div>
                </div>

                {/* Scan Next Button */}
                <button
                  onClick={resetScanner}
                  className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold
                             hover:bg-emerald-700 transition shadow-lg active:scale-95 transform"
                >
                  🔄 Scan Next Ticket
                </button>
              </div>
            )}

            {/* Error - Retry Button */}
            {error && (
              <button
                onClick={resetScanner}
                className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold
                           hover:bg-emerald-700 transition shadow-lg active:scale-95 transform"
              >
                 Try Again
              </button>
            )}
          </div>
        )}
      </div>



    </div>
  );
}

export default ScanTicket;