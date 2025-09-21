const jwt = require("jsonwebtoken");

const generateToken = (id, role) => {
  return jwt.sign(
    { id, role }, 
    process.env.JWT_SECRET, 
    { expiresIn: "7d" }   // token valid for 7 days
  );
};

module.exports = function generateToken(id, role = "seller") {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "8h" });
};
