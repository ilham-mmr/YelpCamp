if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}
console.log(process.env.SECRET);

const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const engine = require('ejs-mate');
const ExpresError = require('./utils/ExpressError');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

const mongoSanitize = require('express-mongo-sanitize');
const MongoStore = require('connect-mongo').default;

const helmet = require('helmet');

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('database connected');
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.engine('ejs', engine);
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,'public')));

const secret = process.env.SECRET || 'bettersecret?';
const store = MongoStore.create({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24 * 3600 // time period in seconds
});

store.on("error",function(e){
    console.log("session store error",e);
})

const sessionConfig = {
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure:true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge : 1000 * 60 * 60 * 24 * 7
    },
    store,
}
app.use(session(sessionConfig));
app.use(flash());


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

app.use(mongoSanitize());

app.use(helmet())


const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com",
    "https://api.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://kit.fontawesome.com",
    "https://cdnjs.cloudflare.com",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com",
    "https://stackpath.bootstrapcdn.com",
    "https://api.mapbox.com",
    "https://api.tiles.mapbox.com",
    "https://fonts.googleapis.com",
    "https://use.fontawesome.com",
];
const connectSrcUrls = [
    "https://api.mapbox.com",
    "https://*.tiles.mapbox.com",
    "https://events.mapbox.com",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/douqbebwk/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);  

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    if(!['/login','/','/register'].includes(req.originalUrl)){
        req.session.returnTo = req.originalUrl;
    }
    res.locals.currentUser = req.user;
    res.locals.success= req.flash('success');
    res.locals.error = req.flash('error');
  
    next();
})


// user routes
app.use('/', userRoutes);
// campground routes
app.use('/campgrounds',campgroundRoutes);
//reviews routes
app.use('/campgrounds/:id/reviews', reviewRoutes)

app.get('/', (req, res) => {
    console.log(req.query)
    res.render('home')
})



app.all('*', (req, res, next) => {
    next(new ExpresError('Page Not Found ', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!';
    res.status(statusCode).render('error', { err });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Serving on port ${port}`);
})