import express from "express";
import cors from "cors";
import notesRouter from "./routes/notes.js";
import foldersRouter from "./routes/folders.js";
import tagsRouter from "./routes/tags.js";

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

app.use("/api/notes", notesRouter);
app.use("/api/folders", foldersRouter);
app.use("/api/tags", tagsRouter);
