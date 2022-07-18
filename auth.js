const jwt = require("jsonwebtoken");

module.exports = async (request, response, next) => {
  //   get the token from the authorization header
  const auth_header = await request.headers.authorization;
  //split authorization header
  const header_parts = await auth_header.split(" ");
  const token = await header_parts[1];
  if (!auth_header) {
    response.status(401).json({
      error: new Error("Invalid header!"),
      message: "Request is missing an Authorization header",
    });
  } else if (header_parts.length != 2) {
    response.status(401).json({
      error: new Error("Invalid header!"),
      message: "Header must contain two parts.",
    });
  } else if (header_parts[0].toLowerCase() != "bearer") {
    response.status(401).json({
      error: new Error("Invalid header!"),
      message: 'Header must start with "Bearer"',
    });
  } else {
    try {
      //check if the token matches the supposed origin
      const decodedToken = await jwt.verify(token, "RANDOM-TOKEN");

      // retrieve the user details of the logged in user
      const user = await decodedToken;

      // pass the user down to the endpoints here
      request.user = user;

      // pass down functionality to the endpoint
      next();
    } catch (error) {
      response.status(401).json({
        error: new Error("Invalid request!"),
        message: "Unauthorized user",
      });
    }
  }
};
