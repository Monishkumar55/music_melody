const path = require('path');
const app = require(path.join(__dirname, '..', 'songstr', 'server.js'));

module.exports = (req, res) => {
  return app(req, res);
};
