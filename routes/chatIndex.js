const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../config/auth")
const Marker = require("../models/Marker");
const Message = require("../models/Message");

router.get("/room/map", ensureAuthenticated, (req, res) => {
  Marker.find()
  .then(marker => {
  
    mapMarkers = JSON.stringify(marker)
    res.render("map",{
      markers: mapMarkers
  
    })});
  });


const defaultMarker =new Marker({
  name: "lobby",
  lat: "00.00",
  lon: "00.00",
  photo: "https://upload.wikimedia.org/wikipedia/commons/8/8d/S%C3%A4rkisalo.vaakuna.svg"
});

router.get("/addMarker", (req, res) => 
res.render("addMarkers",));


router.get("/room/:token", ensureAuthenticated, (req, res) => {
  Marker.findOne({ name: req.params.token })
    .then(marker => {
      Message.find({ room: req.params.token })
        .then(messages => {
          if (marker) {
            res.render("lobby", {
              name: req.user.name,
              profilename: req.user.name,
              marker: marker,
              messages: JSON.stringify(messages.slice(-20))
            })
          } else {
            res.render("lobby", {
              name: req.user.name,
              profilename: req.user.name,
              marker: defaultMarker,
              messages: JSON.stringify(messages.slice(-20))
            })
          }
        })
    }
    );
});


router.post("/addMarker", (req, res) => {
  const { name, lon, lat, photo } = req.body;
  let errors = [];
  if (errors.length > 0) {
    res.render("register", {
      errors,
    });
  } else {
    // Validation passed
    Marker.findOne({ name: name })
      .then(marker => {
        if (marker) {
          //User exists
          errors.push({ msg: "City is already registered" });
          res.render("register", {
            errors
          });
        } else {
          const newMarker = new Marker({
            name: name,
            lat,
            lon,
            photo
          });
          newMarker.save()
              .then(marker => {
                req.flash("success_msg", "New Marker added!")
                res.redirect("/chat/addMarker");
              })
              .catch(err => console.log(err));

        }
      });
  }
});

module.exports = router;
