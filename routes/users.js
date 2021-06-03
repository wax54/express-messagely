const express = require("express");
const User = require("../models/user");

const ExpressError = require("../expressError");
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");
const { route } = require("./auth");
const router = express.Router();


/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/
router.get('/', 
    ensureLoggedIn, 
    async (req, res, next) => {
        try{
            const users = await User.all();
            req.json(users);
        } catch(e) {
            next(e);
        }
});


/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/

router.get('/:username',
    ensureCorrectUser,
    async (req, res, next) => {
        try {
            const username = req.params.username;
            const user = await User.get(username);
            req.json(user);
        } catch (e) {
            next(e);
        }
    });



/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/

router.get('/:username/to',
    ensureCorrectUser,
    async (req, res, next) => {
        try {
            const username = req.params.username;
            const messages = await User.messagesTo(username);
            req.json(messages);
        } catch (e) {
            next(e);
        }
    });


/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get('/:username/from',
    ensureCorrectUser,
    async (req, res, next) => {
        try {
            const username = req.params.username;
            const messages = await User.messagesFrom(username);
            req.json(messages);
        } catch (e) {
            next(e);
        }
    });

module.exports = router;