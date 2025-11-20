require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const linksRouter = require("./routes/links");
const path = require("path");

const app = express();
app.use(express.json());
app.use(cors());

// Healthcheck
app.get("/healthz", (req, res) => res.json({ ok: true, version: "1.0" }));

app.use("/api/links", linksRouter);

// Redirect handler (/:code)
const Link = require("./models/Link");
app.get("/:code", async (req, res) => {
  const { code } = req.params;
  try {
    const link = await Link.findOne({ code });
    if (!link) return res.status(404).send("Not found");
    link.clicks = (link.clicks || 0) + 1;
    link.lastClicked = new Date();
    await link.save();
    return res.redirect(302, link.url);
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server error");
  }
});

// Connect DB and start server
const PORT = process.env.PORT || 4000;
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log("Server listening on", PORT));
  })
  .catch((err) => {
    console.error("DB connection error", err);
  });
