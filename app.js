const express = require("express");
const app = express();

const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");

let db = null;

const dbPath = path.join(__dirname, "userData.db");

app.use(express.json());

const initializeDb = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => console.log("Server started at 3000"));
  } catch (e) {
    console.log(e.message);
  }
};
initializeDb();

app.post("/register", async (request, response) => {
  const { username, name, password, gender, location } = request.body;
  console.log(username);
});
