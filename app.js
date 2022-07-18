const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
//require database connection
const dbConnect = require("./db/dbConnect");
const User = require("./db/userModel");
//execute database connection
dbConnect();

// body parser configuration
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (request, response, next) => {
  response.json({ message: "Hey! This is your server response!" });
  next();
});

//register endpoint
app.post("/register", (request, response) => {
  //hashing the password before sending it to the database with 10 salt rounds
  bcrypt
    .hash(request.body.password, 10)
    .then((hashedPassword) => {
      const user = new User({
        username: request.body.username,
        email: request.body.email,
        password: hashedPassword,
      });
      //save the new user
      user
        .save()
        // return success if the new user is added to the database successfully
        .then((result) => {
          response.status(201).send({
            message: "User created successfully",
            result,
          });
        })
        // catch error if the new user wasn't added successfully to the database
        .catch((error) => {
          response.status(500).send({
            message: "Error creating user",
            error,
          });
        });
    })
    // catch error if the password hash isn't successful
    .catch((error) => {
      response.status(500).send({
        message: "Password was not hashed successfully",
        error,
      });
    });
});

module.exports = app;
