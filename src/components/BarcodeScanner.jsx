import { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

// Opens the device camera and scans for a barcode. Calls onDetected(code)
// the moment it reads one, and onClose() when the user cancels.
// Works on both laptop webcams and phone cameras — no extra hardware.
function BarcodeScanner({ onDetected, onClose }) {
  const containerId = "barcode-scanner-region";
  const scannerRef = useRef(null);
  const hasDetectedRef = useRef(false); // prevents double-fires while camera is stopping

  useEffect(() => {
    const scanner = new Html5Qrcode(containerId);
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" }, // rear camera on phones, default on laptops
        { fps: 10, qrbox: { width: 250, height: 150 } },
        (decodedText) => {
          if (hasDetectedRef.current) return;
          hasDetectedRef.current = true;
          scanner.stop().then(() => onDetected(decodedText));
        },
        () => {} // fires continuously while no barcode is in frame — safe to ignore
      )
      .catch((err) => {
        console.error("Could not start camera:", err);
        alert("Couldn't access the camera. Check browser permissions and try again.");
        onClose();
      });

    // Cleanup: always stop the camera when this component unmounts,
    // otherwise the camera light stays on after closing the scanner.
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center"
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 1050,
      }}
    >
      <div className="bg-white rounded p-3" style={{ width: "320px" }}>
        <div id={containerId} style={{ width: "100%" }} />
        <p className="text-muted small text-center mt-2 mb-2">
          Point the camera at a barcode
        </p>
        <button className="btn btn-outline-secondary w-100" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default BarcodeScanner;
