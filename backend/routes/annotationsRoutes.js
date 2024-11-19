const express = require("express");
const router = express.Router();
const {
  verifyToken,
  getAnnotationsAndNotes,
  saveAnnotation,
  updateAnnotation,
  deleteAnnotation,
} = require("../controllers/annotationController.js");

router.use(verifyToken);

router.get("/annotations", getAnnotationsAndNotes);
router.post("/annotations", saveAnnotation);
router.put("/annotations/:id", updateAnnotation);
router.delete("/annotations/:id", deleteAnnotation);

module.exports = router;
