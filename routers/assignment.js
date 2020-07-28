var express = require("express");
var assignment = express.Router();
const multer = require("multer");
const streamifier = require("streamifier");
const fs = require("fs");

let user = "tbeal"; //TODO: ID should come from frontend

function bufferToStream(buffer) {
  const duplexStream = new Duplex();
  duplexStream.push(buffer);
  duplexStream.push(null);
  return duplexStream;
}

assignment.post("/submission", multer().single("file"), function (
  req,
  res,
  next
) {
  // Check if file was uploaded first
  if (!req.file) {
    res.status(400).send("No file uploaded.");
    return;
  }
  let file = req.file;
  // Redundant server-side check if file type is correct format
  if (file.mimetype !== "application/zip") {
    res.status(415).send("File is not of type .zip");
  }
  // Now we can start the stream
  else {
    const read = streamifier.createReadStream(file.buffer);
    const write = fs.createWriteStream(
      __dirname + `/../../data/${user}-${file.originalname}`
    );
    write.on("error", (err) => {
      console.log(err);
    });
    write.on("pipe", () => {
      console.log("Something is piping");
    });
    write.on("finish", () => {
      res.status(200).send("Hello");
    });

    read.pipe(write);
  }
});

module.exports = assignment;
