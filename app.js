const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const auth = require("./auth");
//require database connection
const dbConnect = require("./db/dbConnect");
const User = require("./db/userModel");
//execute database connection
dbConnect();

//handle CORS error
app.use((resquest, response, next) => {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  response.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});
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

//login endpoint
app.post("/login", (request, response) => {
  //check if user exists
  User.findOne({ username: request.body.username })
    //if user exists
    .then((user) => {
      //compare the password entered with the hashed password in the database
      bcrypt
        .compare(request.body.password, user.password)
        // if the passwords match
        .then((passwordCheck) => {
          // check if password matches
          if (!passwordCheck) {
            return response.status(400).send({
              message: "Passwords does not match",
              error,
            });
          }

          //   create JWT token
          const token = jwt.sign(
            {
              userId: user._id,
              userName: user.username,
            },
            "RANDOM-TOKEN",
            { expiresIn: "24h" }
          );

          //   return success response
          response.status(200).send({
            message: "Login Successful",
            username: user.username,
            token,
          });
        })
        // catch error if password does not match
        .catch((error) => {
          response.status(400).send({
            message: "Passowrd does not match",
            error,
          });
        });
    })
    //catch error if user does not exist
    .catch((error) => {
      response.status(404).send({
        message: "User not found",
        error,
      });
    });
});

//public endpoint
app.get("/public", (request, response) => {
  response.json({ message: "This is endpoint has public access" });
});

//authenticated endpoint
app.get("/auth", auth, (request, response) => {
  response.json({ message: "You are authorised to view this endpoint" });
});
module.exports = app;
