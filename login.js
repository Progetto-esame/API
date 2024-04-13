const bcrypt = require('bcrypt');
const MongoClient = require('mongodb').MongoClient;

function login(email, password) {
    console.log('Connection string: ' + process.env.STRING_CONNECTION);
    MongoClient.connect(process.env.STRING_CONNECTION, (err, client) => {

        if (err) throw err;
        const db = client.db(process.env.DB_NAME);
        const users = db.collection('Utenti');
        users.findOne({ email }, (err, user) => {
            if (err) throw err;
            // User not found
            if (!user) {
                return res.status(401).send('Invalid email or password');
            }
            // Compare the provided password with the hashed password stored in the database
            bcrypt.compare(password, user.password, (err, result) => {
                if (err) throw err;
                if (result) {
                    // Store user data in session
                    req.session.user = user;
                    res.redirect(''); // Redirect to the dashboard page after successful login
                } else {
                    res.status(401).send('Invalid email or password');
                }
            });
        });

    });
}