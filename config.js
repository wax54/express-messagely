/** Common config for message.ly */

// read .env files and make environmental variables

const ENV = require("dotenv").config().parsed;


const DB_BASE_URI = ENV.DB_BASE_URI || "postgresql:///";
const DB_URI = (process.env.NODE_ENV === "test")
  ? `${DB_BASE_URI}messagely_test`
  : `${DB_BASE_URI}messagely`;

const SECRET_KEY = process.env.SECRET_KEY || "secret";

const BCRYPT_WORK_FACTOR = 12;


module.exports = {
  DB_URI,
  SECRET_KEY,
  BCRYPT_WORK_FACTOR
}