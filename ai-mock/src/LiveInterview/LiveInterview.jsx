import React, { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

function LiveInterview() {
  const jitsiContainerRef = useRef(null);
  const navigate = useNavigate();
  const { roomId } = useParams();

  useEffect(() => {
    const domain = "meet.jit.si";
    const role = localStorage.getItem("role");
    const userName = role === "interviewer" ? "Interviewer" : "Candidate";

    // If no roomId, interviewer creates one
    const generatedRoom =
      roomId || "InterviewAce-" + Math.random().toString(36).substring(2, 10);

    const options = {
      roomName: generatedRoom,
      parentNode: jitsiContainerRef.current,
      width: "100%",
      height: 600,
      userInfo: {
        displayName: userName,
      },
    };

    const api = new window.JitsiMeetExternalAPI(domain, options);

    api.addEventListener("videoConferenceLeft", () => {
      alert("Interview ended!");
      navigate("/dashboard");
    });

    if (!roomId && role === "interviewer") {
      // Show the link for sharing
      setTimeout(() => {
        alert(
          `Share this link with your candidate:\n\n${window.location.origin}/live-interview/${generatedRoom}`
        );
      }, 1000);
    }

    return () => api.dispose();
  }, [roomId, navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h2>Live Interview</h2>
      <div ref={jitsiContainerRef} style={{ margin: "20px auto", width: "80%" }} />
    </div>
  );
}

export default LiveInterview;
