const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dns = require("dns");
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

// In-memory URL storage
let urlStore = [];

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/public/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.use(bodyParser.urlencoded({ extended: false }));

const isValidUrl = (inputUrl) => {
  try {
    const urlObj = new URL(inputUrl);
    return urlObj.protocol === "http:" || urlObj.protocol === "https:";
  } catch (err) {
    return false;
  }
};

// POST route to shorten URL
app.post("/api/shorturl", (req, res) => {
  const originalUrl = req.body.url;

  if (!isValidUrl(originalUrl)) {
    return res.json({ error: "invalid url" });
  }
  // Short URL logic
  const shortUrl = urlStore.length + 1;
  urlStore.push({ originalUrl, shortUrl });

  return res.json({ original_url: originalUrl, short_url: shortUrl });
});

// GET route to redirect to original URL
app.get("/api/shorturl/:shortUrl", (req, res) => {
  const shortUrl = parseInt(req.params.shortUrl, 10);
  const urlEntry = urlStore.find((entry) => entry.shortUrl === shortUrl);

  if (!urlEntry) {
    return res.json({ error: "No short URL found" });
  }

  return res.redirect(urlEntry.originalUrl);
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
