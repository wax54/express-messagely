/** User class for message.ly */
const db = require("../db");
const ExpressError = require("../expressError");
const { BCRYPT_WORK_FACTOR } = require("../config");
const bcrypt = require("bcrypt");
const noResult = dbResult => dbResult ? dbResult.rowCount === 0 : false;
const noSuchUserError = username => new ExpressError(`No such user: ${username}`, 404);

/** User of the site. */

class User {

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({username, password, first_name, last_name, phone}) { 
    try {
      const hashed = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
      const result = await db.query(
          `INSERT INTO 
          users(username, password, first_name, last_name, phone, join_at, last_login_at)
          VALUES($1, $2, $3, $4, $5, current_timestamp, current_timestamp)
          RETURNING username, password, first_name, last_name, phone`,
          [username, hashed, first_name, last_name, phone]);

      return result.rows[0];
    }
    catch(e){
      if(e.code === "p_key violation code"){
        throw new ExpressError(`user already exists: ${username}`, 400);
      }
      else throw e;
    }

  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) { 
      const result = await db.query(`
        SELECT password FROM users 
        WHERE username=$1`, 
        [username]);
      if (noResult(result)) throw noSuchUserError(username);
      else return bcrypt.compare(password, result.rows[0].password);
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) { 
      const result = await db.query(`
        UPDATE users 
        SET last_login_at=current_timestamp 
        WHERE username=$1
        RETURNING last_login_at`,
        [username]);
      if (noResult(result)) throw noSuchUserError(username);
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() { 
      const result = await db.query(`
      SELECT username, first_name, last_name, phone 
      FROM users`);

      return result.rows;
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
      const result = await db.query(`
      SELECT username, first_name, last_name, phone, join_at, last_login_at 
      FROM users
      WHERE username=$1`,
      [username]);
      if (noResult(result)) throw noSuchUserError(username);
      return result.rows[0];
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
      const result = await db.query(`
      SELECT m.id, m.body, m.sent_at, m.read_at,
          u.username, u.first_name, u.last_name, u.phone
      FROM messages AS m
      JOIN users as u ON u.username = m.to_username 
      WHERE m.from_username=$1`,
      [username]);
      const messages = result.rows.map(
        ({ id, body, sent_at, read_at, username, first_name, last_name, phone }) => {
          return {  id, 
                    body, 
                    sent_at, 
                    read_at, 
                    to_user:{
                      username, 
                      first_name, 
                      last_name, 
                      phone
                    }}
        });
      return messages;
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {id, first_name, last_name, phone}
   */

  static async messagesTo(username) {
      const result = await db.query(`
      SELECT m.id, m.body, m.sent_at, m.read_at,
          u.username, u.first_name, u.last_name, u.phone
      FROM messages AS m
      JOIN users as u ON u.username = m.from_username 
      WHERE m.to_username=$1`,
      [username]);

      const messages = result.rows.map(
        ({ id, body, sent_at, read_at, username, first_name, last_name, phone }) => {
          return {
            id,
            body,
            sent_at,
            read_at,
            from_user: {
              username,
              first_name,
              last_name,
              phone
            }
          }
        });
      return messages
  }

}


module.exports = User;