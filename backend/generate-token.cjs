// save this as generate-token.js
const jwt = require('jsonwebtoken');

// Use your actual admin user's MongoDB _id here:
const adminId = '680f66d75ed2b587d9369940'; // replace with your admin user's _id if different

const token = jwt.sign(
  { id: adminId, isAdmin: true }, // payload
  'frameely_super_secret_2024',   // secret
  { expiresIn: '7d' }             // token valid for 7 days
);

console.log(token);