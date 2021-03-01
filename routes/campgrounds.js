const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateCampground, campgroundExists } = require('../middleware/middleware');
const campgrounds = require('../controllers/campgrounds');
var multer = require('multer')
const { storage } = require('../cloudinary');
var upload = multer({ storage, limits: { fileSize: 3145728 } });


router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground));

router.get('/new', isLoggedIn, campgrounds.renderNewForm);


router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, campgroundExists, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, campgroundExists, isAuthor, catchAsync(campgrounds.deleteCampground));


router.get('/:id/edit', isLoggedIn, campgroundExists, isAuthor, catchAsync(campgrounds.renderEditForm));



module.exports = router;