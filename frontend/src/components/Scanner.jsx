import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useSearchParams } from "react-router-dom";
import api from "../api/api";
import { getParticipantByQrToken } from "../db/participantStore";
import { addPendingScan } from "../db/scanStore";
import SyncStatus from "../components/SyncStatus";

function Scanner() {
  const scannerRef = useRef(null);
  const statusTimerRef = useRef(null);
  const startCameraRef = useRef(null);
  const scannerStartedRef = useRef(false);
  const camerasRef = useRef([]);

  const [scanSuccess, setScanSuccess] = useState(false);
  const [scanFailure, setScanFailure] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [cameras, setCameras] = useState([]);
  const [cameraSwitching, setCameraSwitching] = useState(false);

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
    scannerStartedRef.current = false;
    let scanProcessing = false;

    const startCamera = (cameraConfig) =>
      scanner.start(
        cameraConfig,
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
            /*
             * ONLINE
             *
             * Send the scan directly to the backend.
             * The backend performs all validation.
             */
            if (navigator.onLine) {
              const response = await api.post(
                "/checkpoints/scan",
                {
                  scanUuid: crypto.randomUUID(),
                  qrToken: decodedText,
                  checkpointId: Number(checkpointId),
                  deviceId: "WEB-DEVICE",
                }
              );

              setScanFailure(false);
              setScanSuccess(true);

              setResult(
                `Scan successful: ${response.data.participantName}`
              );

              setError("");

              if (statusTimerRef.current) {
                clearTimeout(statusTimerRef.current);
              }

              statusTimerRef.current = setTimeout(() => {
                setScanSuccess(false);
              }, 3000);

              return;
            }

            /*
             * OFFLINE
             *
             * Find the participant in local IndexedDB.
             *
             * Local participant data is only used to identify
             * the participant and display their name.
             *
             * The server remains the final authority when
             * the scan is synchronized.
             */
            const participant =
              await getParticipantByQrToken(decodedText);

            if (!participant) {
              throw new Error(
                "Participant not found in offline data."
              );
            }

            /*
             * Store the scan locally.
             */
            const scan = await addPendingScan({
              qrToken: decodedText,
              participantId: participant.id,
              checkpointId: Number(checkpointId),
              scannedAt: new Date().toISOString(),
              deviceId: "WEB-DEVICE",
            });

            setScanFailure(false);
            setScanSuccess(true);

            setResult(
              `Offline scan recorded: ${participant.name}`
            );

            setError("");

            console.log(
              "Offline scan queued:",
              scan
            );

            if (statusTimerRef.current) {
              clearTimeout(statusTimerRef.current);
            }

            statusTimerRef.current = setTimeout(() => {
              setScanSuccess(false);
            }, 3000);

          } catch (err) {
            console.error(err);

            setScanSuccess(false);
            setScanFailure(true);

            setError(
              err.response?.data ||
                err.message ||
                "Scan failed"
            );

            setResult("");

            if (statusTimerRef.current) {
              clearTimeout(statusTimerRef.current);
            }

            statusTimerRef.current = setTimeout(() => {
              setScanFailure(false);
            }, 3000);

          } finally {
            scanProcessing = false;
          }
        },
        () => {
          // Ignore QR detection errors
        }
      );

    startCameraRef.current = startCamera;

    startCamera({ facingMode: "environment" })
      .then(() => {
        if (cancelled) {
          scanner.stop().catch(() => {});
          return;
        }

        scannerStartedRef.current = true;

        /*
         * List the available cameras so the user can
         * flip between them. Camera permission has
         * already been granted at this point.
         */
        Html5Qrcode.getCameras()
          .then((availableCameras) => {
            if (cancelled || !availableCameras) {
              return;
            }

            camerasRef.current = availableCameras;
            setCameras(availableCameras);
          })
          .catch((err) => {
            console.error("Camera list error:", err);
          });
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("Camera error:", err);
          setError("Unable to access camera.");
        }
      });

    return () => {
      cancelled = true;
      startCameraRef.current = null;

      if (statusTimerRef.current) {
        clearTimeout(statusTimerRef.current);
      }

      if (scannerStartedRef.current) {
        scannerStartedRef.current = false;
        scanner.stop().catch(() => {});
      }
    };
  }, [checkpointId]);

  const flipCamera = async () => {
    const scanner = scannerRef.current;
    const startCamera = startCameraRef.current;
    const availableCameras = camerasRef.current;

    if (
      !scanner ||
      !startCamera ||
      availableCameras.length < 2 ||
      cameraSwitching
    ) {
      return;
    }

    setCameraSwitching(true);
    setError("");

    try {
      // Find the camera that is currently running.
      let currentIndex = -1;

      if (scannerStartedRef.current) {
        const currentDeviceId =
          scanner.getRunningTrackSettings()?.deviceId;

        currentIndex = availableCameras.findIndex(
          (camera) => camera.id === currentDeviceId
        );

        await scanner.stop();
        scannerStartedRef.current = false;
      }

      const nextIndex =
        (currentIndex + 1) % availableCameras.length;

      await startCamera(availableCameras[nextIndex].id);

      // The page was closed while the camera was starting.
      if (startCameraRef.current !== startCamera) {
        scanner.stop().catch(() => {});
        return;
      }

      scannerStartedRef.current = true;
    } catch (err) {
      console.error("Camera switch error:", err);
      setError("Unable to switch camera.");
    } finally {
      setCameraSwitching(false);
    }
  };

  return (
    <div>
      <h2>QR Scanner</h2>

      <SyncStatus />

      <p>
        Checkpoint ID: {checkpointId}
      </p>

      <p>
        Status:{" "}
        {navigator.onLine ? "Online" : "Offline"}
      </p>

      {/* SUCCESS INDICATOR */}

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

      {/* FAILURE INDICATOR */}

      {scanFailure && (
        <div
          style={{
            margin: "20px 0",
            padding: "20px",
            backgroundColor: "#f8d7da",
            border: "3px solid #dc3545",
            borderRadius: "10px",
            textAlign: "center",
            color: "#721c24",
            fontSize: "24px",
            fontWeight: "bold",
          }}
        >
          ✕ SCAN FAILED

          <div
            style={{
              fontSize: "18px",
              marginTop: "8px",
            }}
          >
            {error}
          </div>
        </div>
      )}

      <div
        id="qr-reader"
        style={{ width: "400px" }}
      />

      {cameras.length > 1 && (
        <button
          onClick={flipCamera}
          disabled={cameraSwitching}
          style={{
            marginTop: "15px",
            padding: "12px 20px",
            fontSize: "16px",
            cursor: cameraSwitching
              ? "not-allowed"
              : "pointer",
          }}
        >
          {cameraSwitching
            ? "Switching..."
            : "🔄 Flip Camera"}
        </button>
      )}

      {!scanSuccess &&
        !scanFailure &&
        result && (
          <p>{result}</p>
        )}

      {error &&
        !scanFailure && (
          <p>{error}</p>
        )}
    </div>
  );
}

export default Scanner;