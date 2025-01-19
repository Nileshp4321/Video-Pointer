import React, { useState, useRef, useEffect } from "react";
import YouTubeSearch from "../components/YouTubeSearch";
import YouTube from "react-youtube";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [videoData, setVideoData] = useState({
    videoId: "rTF0s1lkTe0",
    timestamp: "",
    note: "",
    annotations: [],
    notes: [],
    successMessage: "",
    errorMessage: "",
    loading: false,
    isEditing: false,
    currentNoteId: null,
    userId: localStorage.getItem("userId"),
  });
  const playerRef = useRef(null);
  const navigate = useNavigate();

  const formattedTimestamp = (timestamp) => {
    if (timestamp < 0) return "0";
    const minutes = Math.floor(timestamp / 60);
    const seconds = timestamp % 60;
    return `${minutes > 0 ? minutes + ":" : ""}${
      seconds < 10 ? "0" : ""
    }${seconds}`;
  };

  const displayTime = formattedTimestamp(videoData.timestamp);

  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    if (videoData.videoId) {
      fetchNotesAndAnnotations();
    }
  }, [videoData.videoId]);

  const fetchNotesAndAnnotations = async () => {
    setVideoData((prev) => ({ ...prev, loading: true }));
    try {
      const token = localStorage.getItem("userToken");
      const response = await axios.get(
        `https://video-pointer-backend-updated.vercel.app/api/annotations/`,
        {
          params: { videoId: videoData.videoId, userId: videoData.userId },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const { notes, annotations } = response.data;
      setVideoData((prev) => ({
        ...prev,
        notes,
        annotations,
        errorMessage: "",
      }));
    } catch (error) {
      setVideoData((prev) => ({
        ...prev,
        errorMessage: "Error fetching notes and annotations. Please try again.",
      }));
      console.error("Error fetching notes and annotations:", error);
    } finally {
      setVideoData((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleVideoSelect = (selectedVideoId) => {
    setVideoData((prev) => ({
      ...prev,
      videoId: selectedVideoId,
      notes: [],
      annotations: [],
    }));
  };

  const handlePlayPause = (event) => {
    if (playerRef.current) {
      const time = playerRef.current.getCurrentTime();
      setVideoData((prev) => ({ ...prev, timestamp: time.toFixed(0) }));
    }
  };

  const formatTimestamp = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleSaveAnnotation = async () => {
    const { note, isEditing, currentNoteId, timestamp } = videoData;
    if (!note) return;
    const formattedTime = formatTimestamp(timestamp);
    try {
      const token = localStorage.getItem("userToken");
      if (isEditing) {
        await axios.put(
          `https://video-pointer-backend-updated.vercel.app/api/annotations/${currentNoteId}`,
          { note },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setVideoData((prev) => ({
          ...prev,
          notes: prev.notes.map((n) =>
            n._id === currentNoteId ? { ...n, note } : n
          ),
          successMessage: "Note updated",
        }));
      } else {
        await axios.post(
          "https://video-pointer-backend-updated.vercel.app/api/annotations",
          { videoId: videoData.videoId, timestamp: formattedTime, note },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setVideoData((prev) => ({
          ...prev,
          notes: [...prev.notes, { timestamp: formattedTime, note }],
          successMessage: `Note saved at timestamp: ${formattedTime}`,
        }));
      }
      setVideoData((prev) => ({ ...prev, note: "" }));
      fetchNotesAndAnnotations();
      setTimeout(
        () => setVideoData((prev) => ({ ...prev, successMessage: "" })),
        3000
      );
    } catch (error) {
      setVideoData((prev) => ({
        ...prev,
        errorMessage: "Error saving note. Please try again.",
      }));
      console.error("Error saving note:", error);
    } finally {
      setVideoData((prev) => ({
        ...prev,
        isEditing: false,
        currentNoteId: null,
      }));
    }
  };

  const jumpToTimestamp = (timestamp) => {
    const timeParts = timestamp.split(":");
    const seconds = parseInt(timeParts[0]) * 60 + parseInt(timeParts[1]);
    if (playerRef.current) {
      playerRef.current.seekTo(seconds, true);
      setVideoData((prev) => ({ ...prev, timestamp: seconds.toString() }));
    }
  };

  const onPlayerReady = (event) => {
    playerRef.current = event.target;
  };

  const onPlayerStateChange = (event) => {
    if (
      event.data === window.YT.PlayerState.PLAYING ||
      event.data === window.YT.PlayerState.PAUSED
    ) {
      handlePlayPause(event);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("currentUser");
    setVideoData((prev) => ({ ...prev, userId: null }));
    navigate("/login");
  };

  const handleEditAnnotation = (userNote) => {
    setVideoData((prev) => ({
      ...prev,
      note: userNote.note,
      currentNoteId: userNote._id,
      isEditing: true,
    }));
  };

  const handleDeleteAnnotation = async (noteId) => {
    const token = localStorage.getItem("userToken");
    try {
      await axios.delete(`https://video-pointer-backend-updated.vercel.app/api/annotations/${noteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVideoData((prev) => ({
        ...prev,
        notes: prev.notes.filter((note) => note._id !== noteId),
        successMessage: "Note deleted successfully.",
      }));
      setTimeout(
        () => setVideoData((prev) => ({ ...prev, successMessage: "" })),
        3000
      );
    } catch (error) {
      setVideoData((prev) => ({
        ...prev,
        errorMessage: "Error deleting note. Please try again.",
      }));
      console.error("Error deleting note:", error);
    }
  };

  const opts = {
    height: "390",
    width: "650",
  };
  const currentUser = localStorage.getItem("currentUser");

  return (
    <div className="dashboard p-6 bg-gray-50 min-h-screen">
      <div className="w-full flex justify-between items-center mb-4 ">
        <p className="text-lg font-semibold">
          Welcome Back,{" "}
          {currentUser && (
            <span className="text-blue-600 font-bold">{currentUser}</span>
          )}
        </p>
        <button onClick={handleLogout} className="text-red-600 hover:underline">
          Logout
        </button>
      </div>
      <hr />
      <div className="flex flex-col md:flex-row mt-8 gap-8">
        <div className="md:w-3/5 bg-white shadow-lg rounded-lg p-4">
          {videoData.videoId && (
            <>
              <YouTube
                videoId={videoData.videoId}
                onReady={onPlayerReady}
                onStateChange={onPlayerStateChange}
                className="rounded-lg"
                opts={opts}
              />
              <div className="mt-4 bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4">
                  Add Annotations at {displayTime} Seconds
                </h2>
                {videoData.successMessage && (
                  <p className="text-green-600 mb-4">
                    {videoData.successMessage}
                  </p>
                )}
                {videoData.errorMessage && (
                  <p className="text-red-600 mb-4">{videoData.errorMessage}</p>
                )}
                <input
                  type="text"
                  placeholder="Add a note"
                  value={videoData.note}
                  onChange={(e) =>
                    setVideoData((prev) => ({ ...prev, note: e.target.value }))
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none mb-4"
                />
                <button
                  onClick={handleSaveAnnotation}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  {videoData.isEditing ? "Update Note" : "Save Note"}
                </button>
              </div>
            </>
          )}

          <div className="mt-6">
            <h2 className="text-2xl font-bold mb-4">
              Total {videoData.notes.length} Annotations
            </h2>
            <ul className="space-y-4">
              {videoData.notes.map((userNote) => (
                <li
                  key={userNote._id}
                  className="p-4 border border-gray-200 rounded-lg flex justify-between items-center"
                >
                  <span
                    onClick={() => jumpToTimestamp(userNote.timestamp)}
                    className="cursor-pointer"
                  >
                    <strong className=" text-blue-600">
                      {userNote.timestamp}:
                    </strong>{" "}
                    {userNote.note}
                  </span>
                  <div>
                    <button
                      onClick={() => handleEditAnnotation(userNote)}
                      className="text-blue-600 hover:underline mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteAnnotation(userNote._id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="md:w-2/5">
          <YouTubeSearch onSelectVideo={handleVideoSelect} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
