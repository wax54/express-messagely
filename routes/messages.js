const express = require("express");
const Message = require("../models/message");
const ExpressError = require("../expressError");
const {ensureLoggedIn} = require("../middleware/auth");
const router = express.Router();


/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get("/:id", async (req, res, next) => {
    try{
        const currUser = req.user.username;
        const id = req.params.id;
        const message = await Message.get(id);
        if(message.to_user.username === currUser || 
            message.from_user.username === currUser) {
                res.json({ message });
        } else {
            throw new ExpressError("Unauthorized", 401);
        }
        
    } catch(e) {
        next(e);
    }
});


/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post("/", ensureLoggedIn, async (req, res, next) => {
    try {
        const from_username = req.user.username;
        const { to_username, body } = req.body;
        const message = await Message.create({from_username, to_username, body});
        res.status(201).json({ message });
    } catch (e) {
        next(e);
    }
});


/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/
router.post("/:id/read", async (req, res, next) => {
    try {
        const currUser = req.user.username;
        const id = req.params.id;
        const message = await Message.get(id);
        if(message.to_username === currUser){
            res.status(201).json({ message });
        } else {
            throw new ExpressError("Unauthorized", 401)
        }
    } catch (e) {
        next(e);
    }
});

module.exports = router;