var express = require("express");
var term = express.Router({ mergeParams: true });
const projectsRouter = require("./projects");

const students = require("../spoofData");

let termPattern = /^(summer|spring|winter|fall)([0-9]{4})$/i;

term.get("/courses", function (req, res, next) {
  // Check for student directory id on query params
  function error(error) {
    res.status(400).send(error);
  }

  if (req.query.dirid) {
    dirid = req.query.dirid;
    // Find all courses for student with dirid
    let student = students.find((x) => x.dirid == dirid);
    if (student) {
      let courseList = [],
        courses = [];
      let match = req.params.term.match(termPattern);
      if (match) {
        sem = match[1];
        year = match[2];
        try {
          courses = student.courses[year][sem];
        } catch (err) {
          console.error("ERROR: ", err);
        }
        // Add relevant course info to the courseList
        if (courses.length > 0) {
          let courseDistilled = courses.map((x) => {
            return {
              id: x.id,
              instructor: x.instructor,
              description: x.description,
              projects: x.projects.length,
            };
          });
          courseList = [...courseDistilled];
        }
      }

      res.status(200).json({ courseList });
    } else {
      res.status(400).send("Couldn't find student matching directory id");
    }
  }
});

term.use("/:courseid/project", projectsRouter);

module.exports = term;
