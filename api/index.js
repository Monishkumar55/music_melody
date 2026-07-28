const app = require('../songstr/server.js');

module.exports = (req, res) => {
  return app(req, res);
};
