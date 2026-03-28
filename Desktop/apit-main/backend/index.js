import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log(err));

// ✅ Example Schema
const ProjectSchema = new mongoose.Schema({
    name: String,
    createdAt: { type: Date, default: Date.now }
});

const Project = mongoose.model("Project", ProjectSchema);

// ✅ Routes
app.get("/projects", async (req, res) => {
    const data = await Project.find();
    res.json(data);
});

app.post("/projects", async (req, res) => {
    const newProject = new Project(req.body);
    await newProject.save();
    res.json(newProject);
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running"));