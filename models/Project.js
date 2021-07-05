const Sequelize = require("sequelize");
const db = require("../database");
const Course = require("./Course");
const Submission = require("./Submission");

const Project = db.define("project", {
  dueDate: { type: Sequelize.DATE },
  title: { type: Sequelize.STRING },
});

// Project.belongsTo(Course, { as: "CourseRef", foreignKey: "courseId" });
Project.hasMany(Submission, { as: "submissions" });

module.exports = Project;
