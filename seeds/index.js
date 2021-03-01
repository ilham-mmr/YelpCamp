const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities')
const { places, descriptors } = require('./seedHelpers')

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('database connected');
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const price = Math.floor(Math.random() * 20) + 10;
        const random1000 = Math.floor(Math.random() * 1000);
        const camp = new Campground({
            author: '603129e91ed36059dc05ad64',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Iusto laborum sequi quasi maxime natus voluptate possimus excepturi impedit, voluptas corporis in omnis soluta molestiae iste quo cumque fugit placeat necessitatibus!',
            price,
            geometry: { type: 'Point' , coordinates: [cities[random1000].longitude, cities[random1000].latitude]},
            images: [
                {
                    url: 'https://res.cloudinary.com/dziob651q/image/upload/v1614261836/YelpCamp/kytbyxef0cwcw5cdce5i.jpg',
                    filename: 'YelpCamp/kytbyxef0cwcw5cdce5i'
                },
            ],
        });
        await camp.save();
    }
}

seedDB()