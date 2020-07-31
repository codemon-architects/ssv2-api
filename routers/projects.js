var express = require("express");
var project = express.Router({ mergeParams: true });
const path = require("path");
const multer = require("multer");
const streamifier = require("streamifier");
const fs = require("fs");

const students = require("../spoofData");

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

//UPLOAD new submission from specific student
project.post("/:projid/submission", multer().single("file"), function (
  req,
  res,
  next
) {
  // Check if file was uploaded
  if (!req.file) {
    console.log("no file");
    res.status(400).send("No file uploaded.");
    return;
  }
  //Check if submission id is included
  if (!req.query.subid) {
    console.log("unknown submission number");
    res.status(400).send("Missing submission number");
    return;
  }
  // Setup necessary variables
  let { term, courseid, projid } = req.params;
  let { dirid, subid } = req.query;
  let file = req.file;
  // Redundant server-side check if file type is correct format
  if (
    file.mimetype !== "application/zip" &&
    file.mimetype !== "application/x-zip-compressed"
  ) {
    res.status(415).send("File is not of type .zip");
  } else {
    console.log(
      "Checking for directory" +
        path.join(
          __dirname,
          `/../../data/${term}/${courseid}/${projid}/${dirid}`
        )
    );
    fs.exists(
      path.join(
        __dirname,
        `/../../data/${term}/${courseid}/${projid}/${dirid}`
      ),
      (exists) => {
        if (exists) {
          console.log("path exists");
          writeFile();
        } else {
          console.log("creating path and parent folders");
          fs.mkdirSync(
            path.join(
              __dirname,
              `/../../data/${term}/${courseid}/${projid}/${dirid}`
            ),
            { recursive: true }
          );
          writeFile();
        }
      }
    );

    //TODO: Who determines the submission number?
    function writeFile() {
      const read = streamifier.createReadStream(file.buffer);
      const write = fs.createWriteStream(
        path.join(
          __dirname,
          "..",
          "..",
          `data/${term}/${courseid}/${projid}/${dirid}/${dirid}-submission-${subid}.zip`
        )
      );

      read.pipe(write);

      write.on("error", (err) => {
        console.log("error in write: ", err);
        res.status(500).send("Error in writing data");
      });
      write.on("pipe", () => {
        console.log("Something is piping");
      });
      write.on("finish", () => {
        console.log("Writing successful, now adding new data to the data");
        let date = new Date();
        let sub = {
          dirid,
          ts: date.toLocaleDateString() + " " + date.toLocaleTimeString(),
        };
        let student = students.find((x) => x.dirid === dirid);
        if (student) {
          let match = req.params.term.match(termPattern);
          let semester = match[1],
            year = match[2];
          let projects = student.courses[year][semester].find(
            (x) => x.id == courseid
          ).projects;
          let submissions = projects.find((x) => x.projid == projid)
            .submissions;
          // console.log(submissions);
          submissions.push(sub);
          // console.log(submissions);
          //TODO: Should I send back the newly created data for the submission?
          res.status(200).json(sub);
        }
      });
    }
  }
});

//DOWNLOAD a particular submission from a student
project.get("/:projid/submission/:subid", function (req, res, next) {
  // Setup all necessary variables
  let { term, courseid, projid, subid } = req.params;
  let { dirid } = req.query;

  console.log(
    "Checking for submission at directory" +
      path.join(__dirname, `/../../data/${term}/${courseid}/${projid}/${dirid}`)
  );
  fs.exists(
    path.join(
      __dirname,
      "..",
      "..",
      `data/${term}/${courseid}/${projid}/${dirid}/${dirid}-submission-${subid}.zip`
    ),
    (exists) => {
      if (exists) {
        console.log("path exists");
        res.setHeader("Content-Disposition", "attachment");
        res.download(
          path.join(
            __dirname,
            "..",
            "..",
            `data/${term}/${courseid}/${projid}/${dirid}/${dirid}-submission-${subid}.zip`
          ),
          `submission-${subid}.zip`,
          (err) => {
            if (err) {
              console.log(err);
            } else {
              console.log("Download complete");
            }
          }
        );
      } else {
        console.log("No submission exists for this user at this path");
        res.status(400).send("Malformed download path");
      }
    }
  );
});

//TODO: Each submission should have a submission number, project id ref, student id ref
// Path on backend: term/course/project/student/submission#
//TODO: Generate a course: Creates directory of students

module.exports = project;
