var express = require("express");
var project = express.Router({ mergeParams: true });
const multer = require("multer");
const streamifier = require("streamifier");
const fs = require("fs");

const students = require("../spoofData");

let user = "tbeal"; //TODO: ID should come from frontend

let termPattern = /^(summer|spring|winter|fall)([0-9]{4})$/i;

// Returns list of all project names for specified course
project.get("/", function (req, res, next) {
  dirid = req.query.dirid;
  // Find all courses for student with dirid
  let student = students.find((x) => x.dirid == dirid);
  let courseid = req.params.courseid;
  // Search for matching student
  if (student) {
    let projects = [];
    let match = req.params.term.match(termPattern);
    if (match) {
      sem = match[1];
      year = match[2];
      courses = student.courses[year][sem];
      // Get project info from specific course
      if (courses.length > 0) {
        let course = courses.find((course) => course.id == courseid); // Get specific course
        let projectsDistilled = course.projects.map((proj) => {
          let subs = proj.submissions.filter((sub) => sub.dirid == dirid);
          return {
            ...proj,
            submissions: subs,
          };
        });
        projects = [...projectsDistilled];
      }

      res.status(200).json({ projects });
    } else {
      error("Couldn't find student matching directory id");
    }
  }
});

project.post("/:projid/submission", multer().single("file"), function (
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
  console.log(req.file);
  // Redundant server-side check if file type is correct format
  if (
    file.mimetype !== "application/zip" &&
    file.mimetype !== "application/x-zip-compressed"
  ) {
    res.status(415).send("File is not of type .zip");
  } else {
    //TODO: Verify file path and create folders if necessary
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

project.get("/:projid/submission/:sid", function (req, res, next) {
  let projid = req.params.projid,
    sid = req.params.sid,
    dirid;
  // Check for student directory id on query params
  if (req.query.dirid) {
    dirid = req.query.dirid;
  } else {
    res.status(400).send("Unknown or missing directory id for student");
  }
});

project.get("/:projid/submissions", function (req, res, next) {
  let projid = req.params.projid;
  // Check for student directory id on query params
  if (req.query.dirid) {
    dirid = req.query.dirid;
    // Get data from DB
  } else {
    res.status(400).send("Unknown or missing directory id for student");
  }
});

//TODO: Each submission should have a submission number, project id ref, student id ref
// term/course/project/student/submission#
//TODO: Generate a course: Creates directory of students

module.exports = project;
