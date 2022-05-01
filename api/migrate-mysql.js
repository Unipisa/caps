var mysql      = require('mysql2');
var Exam = require('./models/Exam');
var User = require('./models/User');
var Degree = require('./models/Degree');
var mongoose = require('mongoose');
const e = require('express');

function query(connection, q) {
    return new Promise((resolve, reject) => {
        connection.query(q, (err, res) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(res);
            }
        })
    })
}

async function importData() {

    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/caps')

    var connection = mysql.createConnection({
        host     : process.env.MYSQL_HOST || 'localhost',
        user     : process.env.MYSQL_USER || 'caps',
        password : process.env.MYSQL_PASSWORD || 'secret',
        database : process.env.MYSQL_DATABASE || 'caps',
        port     : process.env.MYSQL_PORT || '3306'
    });
    
    connection.connect();

    var results = null;
    
    // Import exams
    process.stdout.write("| Exams ")
    await Exam.deleteMany({}); // Drop all data
    results = await query(connection, 'SELECT * FROM exams');
    console.log(`caricamento ${ results.length } esami...`);
    await Promise.all(results.map(element => {
        element.old_id = element.id;
        const e = new Exam(element);
        return e.save();
    }));
    const examsImported = await Exam.countDocuments();
    console.log("(" + examsImported + " documents imported)");

    // Import users
    process.stdout.write("| Users ");
    await User.deleteMany({});
    results = await query(connection, 'SELECT * from users');
    console.log(`caricamento ${ results.length } utenti...`);
    await Promise.all(results.map(element => {
        element.old_id = element.id;
        const u = new User(element);
        return u.save();
    }))
    const usersImported = await User.countDocuments();
    console.log("(" + usersImported + " documents imported)");

    // Import degrees
    process.stdout.write("| Degrees ")
    await Degree.deleteMany({}); // Drop all data
    results = await query(connection, 'SELECT * FROM degrees');
    console.log(`caricamento ${ results.length } corsi di laurea...`);
    await Promise.all(results.map(element => {
        element.old_id = element.id;
        const e = new Degree(element);
        return e.save();
    }));
    const degreesImported = await Degree.countDocuments();
    console.log("(" + degreesImported + " documents imported)");

    await mongoose.connection.close()
    connection.end();
}

console.log("Starting the import of the data from MySQL to MongoDB")
importData().then((res) => console.log("Import done"));