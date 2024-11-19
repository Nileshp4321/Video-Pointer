const mongoose = require("mongoose");

const AnnotationSchema = new mongoose.Schema(
  {
    videoId: { type: String, required: true },
    timestamp: { type: String, required: true },
    annotationText: { type: String, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Annotation = mongoose.model("Annotation", AnnotationSchema);
module.exports = Annotation;
