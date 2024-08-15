// Imports and Initial Setup
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const multer = require('multer');
const admin = require('firebase-admin');
const { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } = require('firebase/auth');
const { getDatabase, ref, set, get, update } = require('firebase/database');
const { getStorage } = require('firebase-admin/storage');
const { body, validationResult } = require('express-validator');
require('dotenv/config');

// Firebase Admin SDK Configuration
const serviceAccount = require('./config/serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'gs://bfit-94bc9.appspot.com'
});

const bucket = admin.storage().bucket();

// Firebase Configuration
const firebaseConfig = {
    apiKey: process.env.API_KEY,
    authDomain: "bfit-94bc9.firebaseapp.com",
    databaseURL: "https://bfit-94bc9-default-rtdb.firebaseio.com",
    projectId: "bfit-94bc9",
    storageBucket: "bfit-94bc9.appspot.com",
    messagingSenderId: "325741995651",
    appId: "1:325741995651:web:7b70c8f43d4223b4f59db6",
    databaseURL: "https://bfit-94bc9-default-rtdb.firebaseio.com"
};

const firebase = require('firebase/app');
require('firebase/auth'); 
require('firebase/database'); 
firebase.initializeApp(firebaseConfig);

const auth = getAuth();
const db = getDatabase();

// Multer Configuration for File Uploads
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
        return cb(new Error('Invalid file type'), false);
    }
    cb(null, true);
};
const limits = {
    fileSize: 5 * 1024 * 1024 // 5 MB limit
};
const upload = multer({ storage, fileFilter, limits });

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'mysecret',
    resave: false,
    saveUninitialized: true
}));

// Set up EJS
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.set('views', path.join(__dirname, 'views'));

// Authentication Middleware
const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/signup');
    }
};

// Routes
app.get('/', (req, res) => {
    if (req.session.user) {
        res.redirect('/dashboard');
    } else {
        res.redirect('/home');
    }
});

app.get('/home', (req, res) => {
    res.render('home', { title: 'Home - B-Fit', page: 'Home' });
});

app.get('/homeuser', (req, res) => {
    res.render('homeuser', { title: 'Home User - B-Fit', page: 'Home User' });
});

app.get('/nutrition', (req, res) => {
    res.render('nutrition', { title: 'Nutrition - B-Fit', page: 'Nutrition' });
});

app.get('/exercises', (req, res) => {
    res.render('exercises', { title: 'Exercises - B-Fit', page: 'Exercises' });
});

app.get('/pricing', (req, res) => {
    res.render('pricing', { title: 'Pricing - B-Fit', page: 'Pricing' });
});

app.get('/list', (req, res) => {
    res.render('list', { title: 'List - B-Fit', page: 'List' });
});

app.get('/strength', (req, res) => {
    res.render('strength', { title: 'Strength - B-Fit', page: 'Strength' });
});

app.get('/login', (req, res) => {
    if (req.session.user) {
        res.redirect('/dashboard');
    } else {
        res.render('login', { title: 'Login - B-Fit', username: '', errors: [] });
    }
});

app.get('/signup', (req, res) => {
    res.render('signup', { title: 'Sign Up - B-Fit', username: '', errors: [] });
});

app.get('/dashboard', isAuthenticated, async (req, res) => {
    const userId = req.session.user.uid;
    const userRef = ref(db, `users/${userId}`);
    const userSnapshot = await get(userRef);
    const userData = userSnapshot.val();

    res.render('dashboard', { 
        user: userData,
        title: 'Profile - B-Fit',
        page: 'dashboard'
    });
});

app.post('/signup', [
    body('username').isEmail().withMessage('Please enter a valid email address.'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.')
], async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.render('signup', {
            title: 'Sign Up - B-Fit',
            errors: errors.array(),
            username: req.body.username
        });
    }

    const { username, password } = req.body;
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, username, password);
        const user = userCredential.user;

        await set(ref(db, 'users/' + user.uid), {
            username: username,
            createdAt: new Date().toISOString()
        });

        req.session.user = { uid: user.uid, username: username };
        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        res.redirect('/signup');
    }
});

app.post('/login', [
    body('username').isEmail().withMessage('Please enter a valid email address.'),
    body('password').not().isEmpty().withMessage('Password cannot be empty.')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('login', {
            title: 'Login - B-Fit',
            errors: errors.array(),
            username: req.body.username
        });
    }

    const { username, password } = req.body;
    try {
        const userCredential = await signInWithEmailAndPassword(auth, username, password);
        const user = userCredential.user;

        const userRef = ref(db, 'users/' + user.uid);
        const snapshot = await get(userRef);
        const userData = snapshot.exists() ? snapshot.val() : null;

        if (userData) {
            req.session.user = { 
                uid: user.uid, 
                username: userData.username
            };
            res.redirect('/dashboard');
        } else {
            res.redirect('/login');
        }
    } catch (error) {
        console.error(error);
        res.redirect('/login');
    }
});

app.get('/logout', (req, res) => {
    signOut(auth)
        .then(() => {
            req.session.destroy(err => {
                if (err) {
                    console.error(err);
                }
                res.redirect('/');
            });
        })
        .catch(error => {
            console.error(error);
            res.redirect('/dashboard');
        });
});

app.post('/update-credentials', isAuthenticated, upload.single('profileImage'), async (req, res) => {
    const { username, password } = req.body;
    const userId = req.session.user.uid;

    let profileImageUrl = null;

    // Check if a file was uploaded
    if (req.file) {
        const blob = bucket.file(`profile_imgs/${userId}/profileImage.jpg`);
        const blobStream = blob.createWriteStream({
            metadata: {
                contentType: req.file.mimetype
            }
        });

        blobStream.on('error', err => {
            console.error(err);
            res.redirect('/dashboard');
        });

        blobStream.on('finish', async () => {
            profileImageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(blob.name)}?alt=media`;

            // Update the user's profile image URL in the database
            await update(ref(db, `users/${userId}`), { profileImageUrl });

            if (username) {
                await update(ref(db, `users/${userId}`), { username });
            }

            if (password) {
                try {
                    await auth.currentUser.updatePassword(password);
                } catch (error) {
                    console.error(error);
                    return res.redirect('/dashboard');
                }
            }

            res.redirect('/dashboard');
        });

        blobStream.end(req.file.buffer);
    } else {
        // No file uploaded, just update username and/or password
        if (username) {
            await update(ref(db, `users/${userId}`), { username });
        }

        if (password) {
            try {
                await auth.currentUser.updatePassword(password);
            } catch (error) {
                console.error(error);
                return res.redirect('/dashboard');
            }
        }

        res.redirect('/dashboard');
    }
});

app.post('/delete-account', isAuthenticated, async (req, res) => {
    const userId = req.session.user.uid;

    try {
        // Delete user record from database
        await ref(db, `users/${userId}`).remove();

        // Delete user account
        await auth.currentUser.delete();

        // Destroy session
        req.session.destroy(err => {
            if (err) {
                console.error(err);
            }
            res.redirect('/');
        });
    } catch (error) {
        console.error(error);
        res.redirect('/dashboard');
    }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});