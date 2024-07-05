if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require('connect-flash');
const passport = require('passport');
const localStrategy = require('passport-local');
const MongoStore = require('connect-mongo');
const Camp = require('./models/camp'); // Assuming the model is exported correctly
const camps = require('./routes/camps');
const reviews = require('./routes/reviews');
const auth = require('./routes/auth');
const User = require('./models/user');
const ExpressError = require('./utilities/ExpressError');

require('dotenv').config();

// MongoDB connection
mongoose.connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
})
.then(() => {
    console.log("MongoDB connected");
})
.catch(err => {
    console.error("MongoDB connection error:", err.message);
});

// Middleware and configurations
app.engine('ejs', ejsMate);
app.set("views", path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride("_method"));

const sessionConfig = {
    store: MongoStore.create({
        mongoUrl: process.env.DB_URI,
        secret: process.env.SESSION_SECRET,
        touchAfter: 24 * 60 * 60 // 24 hours
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24, // 1 day
        maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
};

app.use(session(sessionConfig));
app.use(flash());

// Passport authentication setup
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Middleware to pass user data to all templates
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

// Routes
app.get("/", async (req, res, next) => {
    try {
        const allCamps = await Camp.find({});
        res.render("home", { title: 'Home', allCamps });
    } catch (err) {
        next(new ExpressError("Failed to retrieve camps", 500));
    }
});

// Auth routes
app.use('/', auth);

// Reviews routes
app.use('/camps/:id/reviews', reviews);

// Camps routes
app.use('/camps', camps);

// Handle 404 errors
app.all('*', (req, res, next) => {
    next(new ExpressError("Page Not Found", 404));
});

// Error handling middleware
app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something Went Wrong" } = err;
    res.status(statusCode).render("error", { message, statusCode, err, title: "Error" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`App is serving on port ${PORT}`);
});
