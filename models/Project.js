const Sequelize = require("sequelize");
const db = require("../database");

const Project = db.define("project", {
  // submissions: { type: Sequelize.ARRAY() },
  dueDate: { type: Sequelize.DATE },
  title: { type: Sequelize.STRING },
});

module.exports = Project;
