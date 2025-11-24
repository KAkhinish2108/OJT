import express from "express";
import cors from "cors";
import multer from "multer";
import { analyzeCode } from "./analyzer.js";

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage()});

// API 1: Analyze raw text code

app.post("/analyze", (req, res) => {
    const { code } = req.body;
    const result = analyzeCode(code);
    res.json({ result});
});


// API 2: Analyze uploaded code file

app.post("/upload", upload.single("file"), (req, res) => {
    const code = req.file.buffer.toString("utf-8");
    const result = analyzeCode(code);
    res.json({ result});
});

app.listen(3000, () => console.log("CosaCode backend running at Port 3000"));


// How the UI Will Use This Backend

// For typing code:
fetch("http://localhost:3000/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code})
});

// For uploading file:
const formData = new FormData();
formData.append("file", file);

fetch("http://localhost:3000/upload", {
  method: "POST",
  body: formData
});
