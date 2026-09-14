import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import api from "../api/api";

function Scanner() {
  const scannerRef = useRef(null);

  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const scanner = new Html5Qrcode("qr-reader");

    scannerRef.current = scanner;

    let cancelled = false;
    let scannerStarted = false;
    let scanProcessing = false;

    scanner
      .start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText) => {
          if (scanProcessing) {
            return;
          }

          scanProcessing = true;

          try {
            await scanner.stop();
            scannerStarted = false;

            const response = await api.post("/checkpoints/scan", {
              scanUuid: crypto.randomUUID(),
              qrToken: decodedText,
              deviceId: "WEB-DEVICE",
            });

            setResult(
              `Scan successful: ${response.data.participantName}`
            );
            setError("");
          } catch (err) {
            console.error(err);

            setError(
              err.response?.data || "Scan failed"
            );

            setResult("");
          } finally {
            scanProcessing = false;
          }
        },
        () => {
          // Ignore QR detection errors while scanning
        }
      )
      .then(() => {
        if (cancelled) {
          scanner.stop().catch(() => {});
          return;
        }

        scannerStarted = true;
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("Camera error:", err);
          setError("Unable to access camera.");
        }
      });

    return () => {
      cancelled = true;

      if (scannerStarted) {
        scanner.stop().catch(() => {});
      }
    };
  }, []);

  return (
    <div>
      <h2>QR Scanner</h2>

      <div
        id="qr-reader"
        style={{ width: "400px" }}
      />

      {result && <p>{result}</p>}

      {error && <p>{error}</p>}
    </div>
  );
}

export default Scanner;