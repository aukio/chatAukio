const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../config/auth")



// Welcome page
router.get("/", (req, res) => res.render("login"));
// dashboard

router.get("/credits", (req, res) => 
res.render("credits",));

router.get("/about", (req, res) => 
res.render("about",));


module.exports = router;