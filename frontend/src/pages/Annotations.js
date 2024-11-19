import React, { useState, useEffect } from "react";
import axios from "axios";

function Annotations({ videoId, playerRef }) {
  const [notes, setNotes] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedNote, setEditedNote] = useState("");

  useEffect(() => {
    fetchNotesAndAnnotations();
  }, [videoId]);

  const fetchNotesAndAnnotations = async () => {
    try {
      const token = localStorage.getItem("userToken");
      const response = await axios.get(
        `http://localhost:5000/api/annotations?videoId=${videoId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setNotes(response.data.notes);
    } catch (error) {
      console.error("Error fetching notes and annotations:", error);
    }
  };

  const jumpToTimestamp = (timestamp) => {
    if (playerRef.current) {
      // Convert the timestamp to seconds
      const [minutes, seconds] = timestamp.split(":").map(Number);
      const totalSeconds = minutes * 60 + seconds;
      playerRef.current.seekTo(totalSeconds, true); // Seek to the timestamp
    }
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
    setEditedNote(notes[index].note);
  };

  const handleUpdate = async (index) => {
    if (!editedNote) return;
    const token = localStorage.getItem("userToken");

    try {
      await axios.put(
        `http://localhost:5000/api/annotations/${notes[index]._id}`,
        { note: editedNote },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const updatedNotes = [...notes];
      updatedNotes[index].note = editedNote;
      setNotes(updatedNotes);
      setEditingIndex(null);
      setEditedNote("");
    } catch (error) {
      console.error("Error updating note:", error);
    }
  };

  const handleDelete = async (index) => {
    const token = localStorage.getItem("userToken");
    try {
      await axios.delete(
        `http://localhost:5000/api/annotations/${notes[index]._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setNotes((prevNotes) => prevNotes.filter((_, i) => i !== index));
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  return (
    <div className="mt-4 ">
      <h2 className="text-2xl font-semibold mb-2">My Annotations</h2>
      <ul className="bg-white rounded-lg shadow-md p-4 flex flex-col ">
        {notes.length <= 0 && (
          <h1 className="text-center">No Annotations Found</h1>
        )}
        {notes.map((userNote, index) => (
          <li
            key={index}
            className="border-b py-2 h-auto w-96 flex justify-between"
          >
            <span
              className="font-medium w-56 cursor-pointer text-blue-600"
              onClick={() => jumpToTimestamp(userNote.timestamp)} // Call the jumpToTimestamp function here
            >
              {userNote.timestamp}:
            </span>
            {editingIndex === index ? (
              <div className="flex items-center">
                <input
                  type="text"
                  value={editedNote}
                  onChange={(e) => setEditedNote(e.target.value)}
                  className="border rounded p-1"
                />
                <button
                  onClick={() => handleUpdate(index)}
                  className="ml-2 text-green-600"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingIndex(null)}
                  className="ml-2 text-red-600"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center">
                <span className="flex-grow">{userNote.note}</span>
                <button
                  onClick={() => handleEdit(index)}
                  className="text-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(index)}
                  className="text-red-600 ml-2"
                >
                  Delete
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Annotations;
