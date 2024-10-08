require('dotenv').config();
const db = require("./mongo.js");
const mongoose = require('mongoose');
const express = require('express');
const RestfulExpressRouter = require('./index.js'); 
const jwt = require('jsonwebtoken');
const login = require('./src/login.js');

const UserSchema = require('./src/UserSchema.js');
const User = mongoose.model('User', UserSchema);

//////////////////////////////
const app = express();
app.use(express.json());

//==Middlewhere
const logRequest = (req, res, next) => {
  // debugger;
  console.log(`Request Method: ${req.method}, URL: ${req.url}`);
  next(); // Proceed to the next middleware or route handler
};


// Middleware  for Auth
const authenticateJWT = (req, res, next) => {
  debugger;
    const token = req.headers['authorization']?.split(' ')[1]; 
    if (!token) {
        return res.sendStatus(403); // Forbidden if no token
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
          console.log(`Verified: ${req.method}, URL: ${req.url}`);
            return res.sendStatus(403); // Forbidden if token is not valid
        }
        
        req.user = user; // Save user info in request object
        next(); // Proceed to the next middleware or route handler
    });
};

///////////////////////////////////////////////

let restfulExpressRouter = new RestfulExpressRouter(User);

restfulExpressRouter.middlewareForList = [logRequest];
restfulExpressRouter.middlewareForGetById = [logRequest];
restfulExpressRouter.middlewareForUpdate = [authenticateJWT];



restfulExpressRouter.addExtraRoute(
  {
    method: 'post',
    path: '/login',
    middlewares: [], // Optional: add any middlewares
    handler: async function(req, res) {
      debugger;
      const rez =  await login(req,res);
      return rez;
      // res.status(200).json({ message: 'This is an additional route (login)' });
    }
  }
);



////----Here it all comes together
app.use('/users', restfulExpressRouter.getRouter());

app.get('/', (req, res) => res.status(200).json({ message: "Welcome to ExpressRestRouter 0.0.1" }));

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
