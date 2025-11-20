const express = require("express");
const router = express.Router();
const Link = require("../models/Link");
const validateUrl = require("../utils/validateUrl");
const { customAlphabet } = require("nanoid");
const nanoid = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  6
);

// POST /api/links - create link
router.post("/", async (req, res) => {
  const { url, code } = req.body;
  if (!url || !validateUrl(url))
    return res.status(400).json({ error: "Invalid URL" });

  let shortCode = code;
  if (shortCode) {
    if (!/^[A-Za-z0-9]{6,8}$/.test(shortCode))
      return res
        .status(400)
        .json({ error: "Code must match [A-Za-z0-9]{6,8}" });
    const exists = await Link.findOne({ code: shortCode });
    if (exists) return res.status(409).json({ error: "Code already exists" });
  } else {
    // generate until unique
    let tries = 0;
    do {
      shortCode = nanoid();
      const e = await Link.findOne({ code: shortCode });
      if (!e) break;
      tries++;
    } while (tries < 5);
  }

  const newLink = new Link({ code: shortCode, url });
  await newLink.save();
  res.status(201).json(newLink);
});

// GET /api/links - list all
router.get("/", async (req, res) => {
  const links = await Link.find({}).sort({ createdAt: -1 });
  res.json(links);
});

// GET /api/links/:code - stats
router.get("/:code", async (req, res) => {
  const { code } = req.params;
  const link = await Link.findOne({ code });
  if (!link) return res.status(404).json({ error: "Not found" });
  res.json(link);
});

// DELETE /api/links/:code
router.delete("/:code", async (req, res) => {
  const { code } = req.params;
  const link = await Link.findOneAndDelete({ code });
  if (!link) return res.status(404).json({ error: "Not found" });
  res.json({ ok: true });
});

module.exports = router;
