import { useState } from "react";
import axios from "axios";

export default function MatchingModal({ onClose }) {
  const [status, setStatus] = useState("searching");

  const findMatch = async () => {
    try {
      const res = await axios.get("/api/match"); // Adjust API endpoint
      if (res.data.data === "wait_partner") {
        setStatus("waiting");
      } else {
        setStatus("matched");
      }
    } catch (err) {
      setStatus("error");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg text-center">
        <h2>Finding a Match...</h2>
        <p>{status === "waiting" ? "Waiting for a partner..." : "Match Found!"}</p>
        <button onClick={onClose} className="mt-4 bg-red-500 text-white px-4 py-2 rounded">
          Cancel
        </button>
      </div>
    </div>
  );
}
