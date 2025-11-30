const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//register controller
const registerUser = async (req, res) => {
  try {
    //extract user info from our request body
    const { username, email, password, role } = req.body;

    //if user already exists in the database
    const checkExisitingUser = await User.findOne({
      $or: [{ username }, { email }],
    }); //means username=username or email=email;
    if (checkExisitingUser) {
      return res.status(400).json({
        success: false,
        message:
          "User already exists with same username or email, try with a different username or email",
      });
    }

    //hashing password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //create a new user and save in database
    const newlyCreatedUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role: role || "user",
    });

    if (newlyCreatedUser) {
      return res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: newlyCreatedUser,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Unable to register user",
      });
    }
  } catch (e) {
    console.error("Error registering user", e);
    res.status(500).json({
      success: false,
      message: "Registration failed from server",
    });
  }
};

//login controller
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    //find if the current user exists in the database
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "No user found with provided username",
      });
    }

    //if the password is correct or not
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: "Password entered doesn't match",
      });
    }

    //creating token containing the user info
    // - used for various purposes like stored in cookie fetched and used in api, or stored in session storage and then used
    //use - jwt(json web token)
    const accessToken = jwt.sign(
      {
        userId: user._id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "15m",
      }
    );

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user,
      accessToken,
    }); //passed to frontend, this token, use this token for access
  } catch (e) {
    console.error("Error logging in user", e);
    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

module.exports = { registerUser, loginUser };
