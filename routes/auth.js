const express = require("express");
const { SECRET_KEY } = require("../config");
const User = require("../models/user");
const ExpressError = require("../expressError");
const JWT = require("jsonwebtoken");
const router = express.Router();

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/
router.post('/login', async (req, res, next) => {
    try{
        const { username, password } = req.body;
        if (!username || !password)
            throw new ExpressError("missing inputs", 400);
        const valid = await User.authenticate(username, password);
        if(valid){
            await User.updateLoginTimestamp(username);
            token = JWT.sign({ username }, SECRET_KEY);
            res.json({ token });
        } else {
            throw new ExpressError("invalid credentials", 400);
        }
    } catch(e) {
        next(e);
    }
});


/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

router.post('/register', async (req, res, next) => {
    try {
        const { username, password, first_name, last_name, phone } = req.body;
        if(!username || !password || !first_name || !last_name || !phone)
            throw new ExpressError("missing inputs", 400);
        await User.register({username, password, first_name, last_name, phone});

        const token = JWT.sign({username}, SECRET_KEY);
        res.status(201).json({ token });
    } catch (e){
        if (e.code === "p_key violation code") {
            e = new ExpressError(`user already exists: ${username}`, 400);
        }
        next(e);
    }
});

module.exports = router;