import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 9000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/srm_mongo";

app.use(cors());
app.use(express.json());

const noteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    tags: { type: [String], default: [] },
    createdBy: { type: String, default: "anonymous" },
    createdByRole: { type: String, default: "USER" }
  },
  { timestamps: true }
);

const Note = mongoose.model("Note", noteSchema);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, default: "" },
    role: { type: String, required: true, default: "USER" }
  },
  { timestamps: true }
);

const MongoUser = mongoose.model("MongoUser", userSchema, "mongo_users");

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "srm-node-backend" });
});

app.get("/api/mongo/notes", async (req, res) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/mongo/notes/:id", async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/mongo/notes", async (req, res) => {
  try {
    const { title, content, tags, createdBy, createdByRole } = req.body;
    const note = new Note({ title, content, tags, createdBy, createdByRole });
    const saved = await note.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/api/mongo/users", async (req, res) => {
  try {
    const users = await MongoUser.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/mongo/users", async (req, res) => {
  try {
    const { name, email, phone, role } = req.body;
    const user = await MongoUser.findOneAndUpdate(
      { email },
      { name, phone, role },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put("/api/mongo/notes/:id", async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    const note = await Note.findByIdAndUpdate(
      req.params.id,
      { title, content, tags },
      { new: true }
    );
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }
    res.json(note);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete("/api/mongo/notes/:id", async (req, res) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }
    res.json({ message: "Note deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log(`Connected to MongoDB: ${MONGO_URI}`);
    app.listen(PORT, () => {
      console.log(`Node backend running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  });
