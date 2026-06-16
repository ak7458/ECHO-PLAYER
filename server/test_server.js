const express = require('express');
const app = express();
const server = app.listen(5000, () => {
  console.log("Listening on 5000");
});
server.on('error', (e) => {
  console.error("Server error", e);
});
process.on('exit', (code) => {
  console.log("Process exiting with code", code);
});
