const User = require("../models/User");
const jwt = require("jsonwebtoken");

exports.registerUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const newUser = new User({ email, password });
    const currentUser = email;
    const user = await newUser.save();
    console.log("dataf<>>>>>>>>>>>>>>>>>>>>>", user);

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      {
        expiresIn: "3h",
      }
    );
    console.log("token", token);

    res.status(201).json({
      message: "User registered successfully",
      token,
      currentUser,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(400).json({ message: "Error registering user" });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  const currentUser = email;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      {
        expiresIn: "3h",
      }
    );
    // console.log("token", token);
    console.log("user", user);
    res.json({ message: "Login successful", token, user, currentUser });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Error logging in" });
  }
};
