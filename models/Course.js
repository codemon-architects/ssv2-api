const Sequelize = require("sequelize");
const db = require("../database");
const Project = require("./Project");

const Course = db.define("course", {
  instructor: { type: Sequelize.STRING },
  title: { type: Sequelize.STRING },
  description: { type: Sequelize.STRING },
  term: { type: Sequelize.STRING },
});

Course.hasMany(Project, { as: "projects" });

module.exports = Course;
