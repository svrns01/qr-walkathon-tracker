import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useSearchParams } from "react-router-dom";
import api from "../api/api";

function Scanner() {
  const scannerRef = useRef(null);

  const [scanSuccess, setScanSuccess] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const [searchParams] = useSearchParams();
  const checkpointId = searchParams.get("checkpointId");

  useEffect(() => {
    if (!checkpointId) {
      setError("No checkpoint selected.");
      return;
    }

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
          qrbox: {
            width: 250,
            height: 250,
          },
        },
        async (decodedText) => {
          if (scanProcessing) {
            return;
          }

          scanProcessing = true;

          try {
            const response = await api.post(
              "/checkpoints/scan",
              {
                scanUuid: crypto.randomUUID(),
                qrToken: decodedText,
                checkpointId: Number(checkpointId),
                deviceId: "WEB-DEVICE",
              }
            );

            setScanSuccess(true);

            setResult(
              `Scan successful: ${response.data.participantName}`
            );

            setError("");

            setTimeout(() => {
              setScanSuccess(false);
            }, 3000);

          } catch (err) {
            console.error(err);

            setScanSuccess(false);

            setError(
              err.response?.data || "Scan failed"
            );

            setResult("");
          } finally {
            scanProcessing = false;
          }
        },
        () => {
          // Ignore QR detection errors
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
  }, [checkpointId]);

  return (
    <div>
      <h2>QR Scanner</h2>

      <p>
        Checkpoint ID: {checkpointId}
      </p>

      {scanSuccess && (
        <div
          style={{
            margin: "20px 0",
            padding: "20px",
            backgroundColor: "#d4edda",
            border: "3px solid #28a745",
            borderRadius: "10px",
            textAlign: "center",
            color: "#155724",
            fontSize: "24px",
            fontWeight: "bold",
          }}
        >
          ✓ SCAN SUCCESSFUL

          <div
            style={{
              fontSize: "18px",
              marginTop: "8px",
            }}
          >
            {result}
          </div>
        </div>
      )}

      <div
        id="qr-reader"
        style={{ width: "400px" }}
      />

      {!scanSuccess && result && (
        <p>{result}</p>
      )}

      {error && <p>{error}</p>}
    </div>
  );
}

export default Scanner;