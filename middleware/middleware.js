const { campgroundSchema, reviewSchema } = require('../utils/schemas');
const ExpresError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const Review = require('../models/review');


module.exports.isLoggedIn = (req, res, next) => {
    // console.log('req.user', req.user);
    if (!req.isAuthenticated()) {
        req.flash('error', 'you must be signed in first!');
        return res.redirect('/login');
    }
    next();
}

//redirect to /campgrounds if the user is already logged in
module.exports.notLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        req.flash("error", "You are already logged in");
        return res.redirect("/campgrounds");
    }
    next();
};

//
module.exports.validateCampground = (req, res, next) => {
    console.log(req.body);
    const { price } = req.body.campground;

    req.body.campground.price = Number(price);
    // console.log(req.body);

    const { error } = campgroundSchema.validate(req.body);

    if (error) {
        const msg = error.details.map(el => el.message).join();
        throw new ExpresError(msg, 400);
    } else {
        next();
    }
}
// to check wheter a campground is owned by authro
module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    // const campground = await Campground.findById(id);
    campground = res.locals.foundCampground;
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', "You don't have a permission to do that");
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}



module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join();
        throw new ExpresError(msg, 400);
    } else {
        next();
    }
}


module.exports.campgroundExists = async (req, res, next) => {
    try {
        const { id } = req.params;
        const campground = await Campground.findById(id);
        if (!campground) {
            throw new ExpresError('Cannot find that campground');
        }
        res.locals.foundCampground = campground;
        next();
    } catch (error) {
        req.flash('error', error.message);
        return res.redirect('/campgrounds');
    }
}

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);

    if (!review.author.equals(req.user._id)) {
        req.flash('error', "You don't have a permission to do that");
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

