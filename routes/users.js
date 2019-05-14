const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../config/auth")
const bcrypt = require("bcryptjs");
const passport = require("passport");
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const async = require('async');


// User model
const User = require("../models/User");

// Login Page
router.get("/login", (req, res) => res.render("Login"));

// Register page
router.get("/register", ensureAuthenticated,(req, res) => res.render("Register"));

// Forgot password pages
router.get("/forgot", (req, res) => res.render("forgot"));


router.get('/reset/:token', function (req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }
    res.render('reset', {
      user: req.user
    });
  });
});


router.get("/profileEdit", ensureAuthenticated, (req, res) =>
  res.render("profileEdit", {
    name: req.user.name,
    username: req.user.name,
    email: req.user.email,
  }));

//Register Handle
router.post("/register", (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];
  // Check required fields
  if (!name || !email || !password || !password2) {
    errors.push({ msg: "Please fill in all fields" });
  }

  // Check passwords match
  if (password !== password2) {
    errors.push({ msg: "Passwords do not match" });
  }

  // Check pass length
  if (password.length < 6) {
    errors.push({ msg: "Password should be at least 6 characters..." })
  }

  if (errors.length > 0) {
    res.render("register", {
      errors,
      name,
      email,
      password,
      password2
    });
  } else {
    // Validation passed
    User.findOne({ email: email })
      .then(user => {
        if (user) {
          //User exists
          errors.push({ msg: "Email is already registered" });
          res.render("register", {
            errors,
            name,
            email,
            password,
            password2
          });
        } else {
          const newUser = new User({
            name: name,
            email,
            password
          });

          bcrypt.genSalt(10, (err, salt) => bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            // Set password to hashed
            newUser.password = hash;
            //Save user
            newUser.save()
              .then(user => {
                req.flash("success_msg", "You are now registered and can log in")
                res.redirect("/users/login");
              })
              .catch(err => console.log(err));
          }))
        }
      });
  }
});


// Login Handle
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/chat/room/suomi",
    failureRedirect: "/users/login",
    failureFlash: true
  })(req, res, next);
});

// Logout Handle
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "you are logged out");
  res.redirect("/users/login");
});

// edit profile info
router.post("/profileEdit", (req, res) => {
  const { name, email, } = req.body;
  let errors = [];
  // Check required fields
  if (!name || !email) {
    errors.push({ msg: "Please fill in all fields" });
  }

  if (errors.length > 0) {
    res.render("profileEdit", {
      errors,
      name,
      email,
      password,
      password2
    });
  } else {
    // Validation passed
    User.findOne({ name: name })
      .then(user => {
        if (user.email == email) {
          //User exists
          errors.push({ msg: "Email is already registered" });
          res.render("profileEdit", {
            errors,
            name,
            email,
          });
        } else {
          user.email = email;
          user.save()
            .then(user => {
              req.flash("success_msg", "Profile Updated")
              res.redirect("/users/profileEdit");
            })
            .catch(err => console.log(err));
        }
      });
  }
});



// change password
router.post("/changePassword", (req, res) => {
  const { password, password2, password3 } = req.body;
  let errors = [];
  // Check required fields


  // Check passwords match
  if (password !== password2) {
    errors.push({ msg: "Passwords do not match" });
  }

  // Check pass length
  if (password.length < 6) {
    errors.push({ msg: "Password should be at least 6 characters..." })
  }



  if (errors.length > 0) {
    res.render("profileEdit", {
      errors
    });
  } else {
    // Validation passed
    bcrypt.compare(password3, req.user.password, (err, ismatch) => {
      if (err) throw err;

      if (ismatch) {
        bcrypt.genSalt(10, (err, salt) => bcrypt.hash(password, salt, (err, hash) => {
          if (err) throw err;
          // Set password to hashed
          req.user.password = hash;
          req.user.save()
          .then(user => {
            req.flash("success_msg", "Password Updated")
            res.redirect("/users/profileEdit");
          })
          .catch(err => console.log(err));
        }))
      } else {
        errors.push({ msg: "wrong password" })
        res.render("profileEdit", {
          errors
        });
          }
    });
  }
});


// <----->   Lähetä sähköpostiin salasanan vaihto linkki <----->
router.post("/forgot", (req, res, next) => {
  async.waterfall([
    function (done) {
      crypto.randomBytes(20, function (err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function (token, done) {
      User.findOne({ email: req.body.email }, function (err, user) {
        if (!user) {
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function (err) {
          done(err, token, user);
        });
      });
    },
    function (token, user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: 'NilssonNiklas',
          pass: '0N0smultitool97'
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'passwordreset@demo.com',
        subject: 'Node.js Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/users/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function (err) {
        req.flash('success_msg', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        done(err, 'done');
      });
    }
  ], function (err) {
    if (err) return next(err);
    res.redirect('/forgot');
  });
});

router.post('/reset/:token', function (req, res) {
  async.waterfall([
    function (done) {
      const { password, password2 } = req.body;

      // Check passwords match
      if (password !== password2) {
        req.flash('error_msg', 'Passwords do not match.');
        return res.redirect('back');
      }

      // Check pass length
      if (password.length < 6) {
        req.flash('error_msg', "Password should be at least 6 characters...")
        return res.redirect('back');

      }


      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
        if (!user) {
          req.flash('error_msg', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }

        bcrypt.genSalt(10, (err, salt) => bcrypt.hash(password, salt, (err, hash) => {
          if (err) throw err;
          // Set password to hashed
          user.password = hash;
          user.resetPasswordToken = undefined;
          user.resetPasswordExpires = undefined;

          user.save(function (err) {
            req.logIn(user, function (err) {
              done(err, user);
            });
          });
        }))
      });
    },

  ], function (err, result) {
    req.flash('success_msg', 'Success! Your password has been changed.');
    res.redirect('/users/login');
  });
});


module.exports = router;
