const Sequelize = require("sequelize");
const db = require("../database");

const Submission = db.define("project", {
  // submissions: { type: Sequelize.ARRAY() },
  submitDate: { type: Sequelize.DATE },
  filepath: { type: Sequelize.STRING },
});

module.exports = Submission;
