require("dotenv").config();
const http = require("http");
const app = require("./app/app");
require("./config/dbConnect");

const PORT = process.env.PORT || 2020;

const server = http.createServer(app);
server.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});

// vF8PdXqeXwYVuxUS
