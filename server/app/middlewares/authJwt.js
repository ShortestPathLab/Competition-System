const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models");
const utils = require("../../utils");

const User = db.user;
const Role = db.role;

verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send({ message: "No token provided!" });
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Unauthorized!" });
    }
    req.userId = decoded.id;
    next();
  });
};

isAdmin = (req, res, next) => {
  User.findById(req.userId).exec().then((user) => {
    Role.find(
      {
        _id: { $in: user.roles }
      })
      .then(
        (roles) => {
          for (let i = 0; i < roles.length; i++) {
            if (roles[i].name === utils.ROLE.admin) {
              next();
              return;
            }
          }

          res.status(403).send({ message: "Require Admin Role!" });
          return;
        }
    ).catch((err)=>{
      res.status(500).send({ message: err });
      return;
    });
  }).catch((err)=>{
    res.status(500).send({ message: err });
    return;
  });
};

isModerator = (req, res, next) => {
  User.findById(req.userId).exec().then((user) => {
    Role.find(
      {
        _id: { $in: user.roles }
      })
      .then(
      (roles) => {
        

        for (let i = 0; i < roles.length; i++) {
          if (roles[i].name === utils.ROLE.moderator) {
            next();
            return;
          }
        }

        res.status(403).send({ message: "Require Moderator Role!" });
        return;
      }
    ).catch((err)=>{
      res.status(500).send({ message: err });
      return;
    });
  }).catch((err)=>{
    res.status(500).send({ message: err });
    return;
  });
};

const authJwt = {
  verifyToken,
  isAdmin,
  isModerator
};
module.exports = authJwt;