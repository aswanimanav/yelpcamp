var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");

//INDEX - show all campgrounds
router.get("/", function (req, res) {
    Campground.find({}, function (err, allCampgrounds) {
        if (err) {
            console.log(err); 
        } else {
            res.render("campgrounds/index", { campgrounds: allCampgrounds, page: 'campgrounds' });
        }
    });
});

// CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, function (req, res) {
    console.log(req.body);
    var name = req.body.name;
    var tarrif = req.body.tarrif;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newCampground = {name: name, tarrif: tarrif, image: image, description: desc, author: author};
    Campground.create(newCampground, function (err, newlyCreated) {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/campgrounds");
        }
    })
});

// NEW - show form to create new campground
router.get("/new", middleware.isLoggedIn, function (req, res) {
    res.render("campgrounds/new");
});


// SHOW - shows more info about one campground
router.get("/:id", function (req, res) {
    Campground.findById(req.params.id).populate("comments").exec(function (err, foundCampground) {
        if (err || !foundCampground) {
            req.flash("error", "Campground not found");
            res.redirect("back");
        } else {
            res.render("campgrounds/show", { campground: foundCampground });
        }
    });
});

// EDIT CAMPGROUND ROUTE 
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findById(req.params.id, function(err, campground){
        res.render("campgrounds/edit", {campground: campground});
    });
});

// UPDATE CAMPGROUND ROUTE 
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, campground){
        if(err) {
            res.redirect("/campground");
        } else {
            res.redirect("/campgrounds/" + req.params.id);
        }
    })
});

// DESTROY CAMPGROUND ROUTE 
router.delete("/:id", middleware.checkCampgroundOwnership, async (req, res) => {
    try {
        let foundCampground = await Campground.findById(req.params.id);
        await foundCampground.deleteOne();
        res.redirect("/campgrounds");
    } catch (error) {
        console.log(error.message);
        res.redirect("/campgrounds");
    }
});


module.exports = router;