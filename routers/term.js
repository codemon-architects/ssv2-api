var express = require("express");
var term = express.Router({ mergeParams: true });
const projectsRouter = require("./projects");
const db = require("../database");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const Course = require("../models/Course");
const students = require("../spoofData");

let termPattern = /^(summer|spring|winter|fall)([0-9]{4})$/i;

term.get("/courses", function (req, res, next) {
  Course.findAll()
    .then((courses) => res.status(200).json(courses))
    .catch((err) => res.status(400).send(err));

  // // Check for student directory id on query params
  // function error(error) {
  //   res.status(400).send(error);
  // }

  // if (req.query.dirid) {
  //   dirid = req.query.dirid;
  //   // Find all courses for student with dirid
  //   let student = students.find((x) => x.dirid == dirid);
  //   if (student) {
  //     let courseList = [],
  //       courses = [];
  //     let match = req.params.term.match(termPattern);
  //     if (match) {
  //       sem = match[1];
  //       year = match[2];
  //       try {
  //         courses = student.courses[year][sem];
  //       } catch (err) {
  //         console.error("ERROR: ", err);
  //       }
  //       // Add relevant course info to the courseList
  //       if (courses.length > 0) {
  //         let courseDistilled = courses.map((x) => {
  //           return {
  //             id: x.id,
  //             instructor: x.instructor,
  //             description: x.description,
  //             projects: x.projects.length,
  //           };
  //         });
  //         courseList = [...courseDistilled];
  //       }
  //     }

  //     res.status(200).json({ courseList });
  //   } else {
  //     res.status(400).send("Couldn't find student matching directory id");
  //   }
  // }
});

term.post("/course", function (req, res) {
  //Testing
  let { instructor, title, description, term } = req.body;
  if (instructor && title && description && term) {
    Course.create({
      instructor,
      title,
      description,
      term,
    })
      .then(res.status(201).send("New course created"))
      .catch((err) => {
        console.log(err);
        res.status(500).send("Creation failed");
      });
  } else {
    res.status(400).send("Missing course information. Creation Failed");
  }
});

term.get("/course", function (req, res) {
  //Testing
  const { id } = req.query;
  if (id) {
    Course.findOne({ where: { id: id } })
      .then((course) =>
        course != null
          ? res.send(course)
          : res.status(404).send("Couldn't find any matching course")
      )
      .catch((err) => console.log(err));
  } else {
    res.status(400).send("Missing course id");
  }
});

term.use(
  "/:courseId/project",
  function (req, res, next) {
    // Check to make sure student id exists on request
    if (req.query.dirid) {
      if (students.find((x) => x.dirid === req.query.dirid)) {
        next();
      } else {
        res.status(400).send("Student doesn't exist");
      }
    } else {
      console.log("missing student id");
      res.status(400).send("Missing student id");
    }
  },
  projectsRouter
);

module.exports = term;
