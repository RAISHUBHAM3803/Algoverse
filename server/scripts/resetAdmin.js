const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../src/models/User');

dotenv.config({ path: require('path').join(__dirname, '../.env') });

async function resetAdmin() {
  try {
    const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/algoverse";
    await mongoose.connect(uri);
    console.log("Connected to DB at:", uri);

    const newPassword = 'Admin@AlgoVerse123!';

    const result = await User.findOne({ email: 'admin@algoverse.dev' });

    if (result) {
      result.password = newPassword;
      result.role = 'admin';
      await result.save();
      console.log("Successfully reset admin password for:", result.email);
    } else {
      console.log("Admin user not found. Creating...");
      await User.create({
        name: "Admin",
        email: "admin@algoverse.dev",
        password: newPassword,
        role: "admin"
      });
      console.log("Admin user created.");
    }
  } catch(e) {
    console.error("Error:", e);
  } finally {
    mongoose.connection.close();
  }
}

resetAdmin();
