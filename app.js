const express = require("express");
const app = express();

const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");

const bcrypt = require("bcrypt");

let db = null;

const dbPath = path.join(__dirname, "userData.db");

app.use((request, response, next) => {
  let data = "";
  request.on("data", (chunk) => {
    data += chunk;
  });

  request.on("end", () => {
    if (data) {
      request.body = JSON.parse(data);
    }
    next();
  });
}); // Adjust the limit as needed

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
  const checkingQuery = `
  SELECT username
  FROM
  user
  WHERE
  username='${username}'`;
  const isUserExist = await db.get(checkingQuery);
  if (isUserExist !== undefined) {
    response.status(400);
    response.send("User already exists");
  } else {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `INSERT INTO user(username,name,password,gender,location) 
      VALUES
      ('${username}','${name}','${hashedPassword}','${gender}','${location}'
      )`;
    const passwordLength = password.length >= 5;
    if (passwordLength) {
      await db.run(query);
      response.send("User created successfully");
    } else {
      response.status(400);
      response.send("Password is too short");
    }
  }
});

app.post("/login", async (request, response) => {
  const { username, password } = request.body;
  const checkingUserQuery = `
  SELECT *
  FROM
  user
  WHERE
  username='${username}'`;
  const userDetails = await db.get(checkingUserQuery);
  if (!userDetails) {
    response.status(400);
    response.send("Invalid user");
  } else {
    const comparedPassword = await bcrypt.compare(
      password,
      userDetails.password
    );
    if (comparedPassword) {
      response.send("Login success!");
    } else {
      response.status(400);
      response.send("Invalid password");
    }
  }
});

app.put("/change-password", async (request, response) => {
  const { username, oldPassword, newPassword } = request.body;
  const checkingUserQuery = `
    SELECT *
    FROM
    user
    WHERE
    username='${username}'`;
  const userDetails = await db.get(checkingUserQuery);
  const comparedPassword = await bcrypt.compare(
    oldPassword,
    userDetails.password
  );
  if (!comparedPassword) {
    response.status(400);
    response.send("Invalid current password");
  } else {
    const passwordLength = newPassword.length;
    if (passwordLength < 5) {
      response.status(400);
      response.send("Password is too short");
    } else {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const query = `
            UPDATE user
            SET
            password='${hashedPassword}'`;
      await db.run(query);
      response.send("Password updated");
    }
  }
});

module.exports = app;
