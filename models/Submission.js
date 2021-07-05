const Sequelize = require("sequelize");
const db = require("../database");

const Submission = db.define("project", {
  submitDate: { type: Sequelize.DATE },
  filepath: { type: Sequelize.STRING },
});

module.exports = Submission;
