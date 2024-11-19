const mongoose = require("mongoose");
module.exports = async function connectDB(app, PORT) {
  try {
    const connect = await mongoose.connect(
      "mongodb+srv://nileshp:Okk12345@cluster0.cwmozw9.mongodb.net"
    );
    console.log("Database Connected ");
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
  }
};
