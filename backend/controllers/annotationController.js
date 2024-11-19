const Annotation = require("../models/Annotation");
const Note = require("../models/Note");
const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  console.log("verify token>>>>>>>>>>>>>>>>>>>>", token);
  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Unauthorized" });
    req.userId = decoded.id;
    next();
  });
};

const getAnnotationsAndNotes = async (req, res) => {
  const { videoId, userId } = req.query;

  console.log("userId?>>>>>>>>>>>", userId);

  if (!videoId) {
    return res.status(400).json({ message: "Video ID is required" });
  }

  try {
    const [notes, annotations] = await Promise.all([
      Note.find({ videoId, userId }),
      Annotation.find({ videoId, userId }),
    ]);

    res.json({ notes, annotations });
  } catch (error) {
    console.error("Error fetching notes and annotations:", error);
    res.status(500).json({ message: "Error fetching notes and annotations" });
  }
};

const saveAnnotation = async (req, res) => {
  const { videoId, timestamp, note, annotationText } = req.body;

  try {
    const promises = [];
    if (note) {
      const newNote = new Note({
        videoId,
        timestamp,
        note,
        userId: req.userId,
      });
      promises.push(newNote.save());
    }
    if (annotationText) {
      const annotation = new Annotation({
        videoId,
        timestamp,
        annotationText,
        userId: req.userId,
      });
      promises.push(annotation.save());
    }

    await Promise.all(promises);

    res.status(201).json({ message: "Note or annotation saved successfully" });
  } catch (error) {
    console.error("Error saving annotation:", error);
    res.status(500).json({ message: "Error saving annotation" });
  }
};

const updateAnnotation = async (req, res) => {
  const { id } = req.params;
  const { note } = req.body;

  try {
    const updatedAnnotation = await Note.findByIdAndUpdate(
      id,
      { note },
      { new: true, runValidators: true } 
    );

    if (!updatedAnnotation) {
      return res.status(404).json({ message: "Annotation not found" });
    }

    res.json({ message: "Annotation updated successfully", updatedAnnotation });
  } catch (error) {
    console.error("Error updating annotation:", error);
    res.status(500).json({ message: "Error updating annotation" });
  }
};

const deleteAnnotation = async (req, res) => {
  const { id } = req.params;
  console.log("id", id);
  try {
    const deletedAnnotation = await Note.findByIdAndDelete(id);

    if (!deletedAnnotation) {
      return res.status(404).json({ message: "Annotation not found" });
    }

    res.json({ message: "Annotation deleted successfully" });
  } catch (error) {
    console.error("Error deleting annotation:", error);
    res.status(500).json({ message: "Error deleting annotation" });
  }
};

module.exports = {
  verifyToken,
  getAnnotationsAndNotes,
  saveAnnotation,
  updateAnnotation,
  deleteAnnotation,
};
