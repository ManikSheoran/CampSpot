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

const camps = require('./routes/camps.js');
const reviews = require('./routes/reviews.js');
const auth = require('./routes/auth.js');
const User = require('./models/user.js');
const ExpressError = require('./utilities/ExpressError');

require('dotenv').config();

mongoose.set('strictQuery', true);

mongoose.connect(process.env.DB_URI)
    .then(() => {
        console.log("Mongo Connection Open!!!");
    })
    .catch(err => {
        console.log("OH NO ERROR!!!");
        console.log(err);
    });

app.engine('ejs', ejsMate);
app.set("views", path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const sessionConfig = {
    secret: 'badsecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

app.get("/", (req, res) => {
    res.render("home", { title: 'Home' });
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
    console.log("App is serving on port 3000");
});
