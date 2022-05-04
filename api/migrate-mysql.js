var mysql      = require('mysql2');
var Exam = require('./models/Exam');
var User = require('./models/User');
var Degree = require('./models/Degree');
var Curriculum = require('./models/Curriculum');
var {   CurriculumCompulsoryExam, 
        CurriculumCompulsoryGroup, 
        CurriculumFreeChoiceGroup, 
        CurriculumExam } = require('./models/CurriculumExam');
var mongoose = require('mongoose');

function write(s) {
    console.log(s);
}

async function importData() {
    console.log("here")

    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/caps')

    console.log("here1")

    var connection = mysql.createConnection({
        host     : process.env.MYSQL_HOST || 'localhost',
        user     : process.env.MYSQL_USER || 'caps',
        password : process.env.MYSQL_PASSWORD || 'secret',
        database : process.env.MYSQL_DATABASE || 'caps',
        port     : process.env.MYSQL_PORT || '3306'
    });
    
    connection.connect();

    function query(q) {
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

    async function count(Collection) {
        return await Collection.countDocuments();
    }

    console.log("here2")

    var results = null;
    
    // Import users
    write("> Users ");
    await User.deleteMany({});
    results = await query('SELECT * from users');
    write(`caricamento ${ results.length } utenti...`);
    await Promise.all(results.map(element => {
        element.old_id = element.id;
        const u = new User(element);
        return u.save();
    }))

    write("(" + (await count(User)) + " documents imported)");

    // Load tags
    write("| Tags ")
    const tags_exams = await query('SELECT * FROM tags_exams');
    const tags = await query('SELECT * FROM tags');
    write(`caricati ${ tags.length } tags...`);
    
    // Import exams
    write("> Exams ")
    await Exam.deleteMany({}); // Drop all data
    results = await query('SELECT * FROM exams');
    write(`caricamento ${ results.length } esami...`);
    exams={};
    (await Promise.all(results.map(element => {
        element.old_id = element.id;
        const tag_ids = tags_exams.filter(t => t.exam_id == element.id).map(t => t.tag_id);
        element.tags = tags.filter(t => tag_ids.includes(t.id)).map(t => t.name);
        const e = new Exam(element);
        return e.save()
    }))).map(e => {exams[e.old_id] = e});
    write("(" + await count(Exam) + " documents imported)");

    // Import groups
    write("| Groups ")
    const groups = await query('SELECT * FROM `groups`');
    const exams_groups = await query('SELECT * FROM exams_groups');
    write(`caricati ${groups.length} elementi`);

    function group_by_id(id) {
        const gs = groups.filter(g => g.id === id);
        console.assert(gs.length === 1, gs, id, groups)
        return gs[0]
    }

    // Import degrees
    write("> Degrees ")
    await Degree.deleteMany({}); // Drop all data
    results = await query('SELECT * FROM degrees');
    write(`caricamento ${ results.length } corsi di laurea...`);
    await Promise.all(results.map(element => {
        element.old_id = element.id;
        element.groups = {}
        groups
            .filter(g => g.degree_id===element.id)
            .map(g => {
                element.groups[g.name] = exams_groups
                    .filter(eg => eg.group_id===g.id)
                    .map(eg => exams[eg.exam_id]._id)});
        if (element.default_group_id) {
            element.default_group = group_by_id(element.default_group_id).name;
        } else {
            element.default_group = "";
        }
        const e = new Degree(element);
        return e.save();
    }));
    write("(" + await count(Degree) + " documents imported)");

    write("| CurriculumExams")
    compulsory_exams = await query("SELECT * FROM compulsory_exams")
    compulsory_groups = await query("SELECT * FROM compulsory_groups")
    free_choice_exams = await query("SELECT * FROM free_choice_exams")

    // import curricula
    write("> Curricula")
    await Curriculum.deleteMany({}) // Drop all data
    results = await query("SELECT * FROM curricula")
    write(`caricamento ${ results.length } curricula...`);
    await Promise.all(results.map(element => {
        element.old_id = element.id;
        element.years = []
        compulsory_exams.filter(e => (e.curriculum_id === element.id))
            .sort((a,b) => (b.position - a.position))
            .map(e => {
                element.years[e.year-1] = element.years[e.year-1] || []
                element.years[e.year-1].push(new CurriculumCompulsoryExam({
                    exam: e.exam_id
                    }))
            })
        compulsory_groups.filter(g => (g.curriculum_id === element.id))
            .sort((a,b) => (b.position - a.position))
            .map(g => {
                element.years[g.year-1] = element.years[g.year-1] || []
                element.years[g.year-1].push(new CurriculumCompulsoryGroup({
                    group: group_by_id(g.group_id).name
                }))
            })
        free_choice_exams.filter(e => (e.curriculum_id === element.id))
            .sort((a,b) => (b.position - a.position))
            .map(e => {
                if (e.group_id) {
                    element.years[e.year-1] = element.years[e.year-1] || []
                    element.years[e.year-1].push(new CurriculumFreeChoiceGroup({
                        group: group_by_id(g.group_id).name
                    }))
                } else {
                    element.years[e.year-1].push(new CurriculumExam())
                }
            })
        const e = new Curriculum(element);
        return e.save();
    }))


    await mongoose.connection.close()
    connection.end();
}

write("Starting the import of the data from MySQL to MongoDB")
importData().then((res) => write("Import done"));