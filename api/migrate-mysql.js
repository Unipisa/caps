let mysql = require('mysql2')
let Exam = require('./models/Exam')
let User = require('./models/User')
let Degree = require('./models/Degree')
let Curriculum = require('./models/Curriculum')
let FormTemplate = require('./models/FormTemplate')
let Form = require('./models/Form')
let Proposal = require('./models/Proposal')
let Attachment = require('./models/Attachment')
let Comment = require('./models/Comment')
let Settings = require('./models/Settings')

let ObjectId = require('mongoose').Types.ObjectId

let {   CurriculumCompulsoryExam, 
        CurriculumCompulsoryGroup, 
        CurriculumFreeChoiceGroup, 
        CurriculumFreeChoiceExam } = require('./models/CurriculumExam')
let {   ProposalCompulsoryExam,
        ProposalCompulsoryGroup,
        ProposalFreeChoiceExam,
        ProposalExternalExam,
        ProposalAuthAttachment,
        ProposalFileAttachment,
        ProposalCommentAttachment } = require('./models/ProposalSchema')
let mongoose = require('mongoose')

const LOAD_ATTACHMENTS = false

function write(s) {
    console.log(s);
}

async function importData() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/caps')

    console.log(`MYSQL_PASSORD: ${process.env.MYSQL_PASSWORD}`)

    var connection = mysql.createConnection({
        host     : process.env.MYSQL_HOST || 'localhost',
        user     : process.env.MYSQL_USER || 'caps',
        password : process.env.MYSQL_PASSWORD,
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

    var results = null;
    
    write("> Settings ")
    await Settings.deleteMany({})
    results = await query("SELECT * from settings")
    write(`caricamento ${ results.length } settings...`)
    const s = new Settings()
    await Promise.all(results.map(element => {
        s[{
            'disclaimer': 'disclaimer',
            'cds': 'cds',
            'department': 'department',
            'user-instructions': 'userInstructions',
            'notified-emails': 'notifiedEmails',
            'approval-signature-text': 'approvalSignatureText',
            'pdf-name': 'pdfName'
        }[element.field]] = element.value
    }))
    await s.save()
    
    // Import users
    write("> Users ");
    await User.deleteMany({});
    results = await query('SELECT * from users')
    users = {}
    write(`caricamento ${ results.length } utenti...`);
    (await Promise.all(results.map(element => {
        const u = {}
        u.old_id = element.id
        u.username = element.username,
        u.name = element.name
        u.first_name = element.givenname
        u.last_name = element.surname
        u.id_number = element.number
        u.email = element.email
        u.admin = element.admin
        return new User(u).save();
    }))).forEach(u => {users[u.old_id] = u})

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
        const e = {}
        e.old_id = element.id
        e.name = element.name
        e.code = element.code
        e.sector = element.sector
        e.credits = element.credits
        const tag_ids = tags_exams.filter(t => t.exam_id == element.id).map(t => t.tag_id)
        e.tags = tags.filter(t => tag_ids.includes(t.id)).map(t => t.name)
        e.notes = element.notes  
        return new Exam(e).save()
    }))).map(e => {exams[e.old_id] = e});
    write("(" + await count(Exam) + " documents imported)");

    // Import groups
    write("| Groups ")
    const groups = await query('SELECT * FROM `groups`');
    const exams_groups = await query('SELECT * FROM exams_groups');
    write(`caricati ${groups.length} elementi`)

    function group_by_id(id) {
        const gs = groups.filter(g => g.id === id)
        if (gs.length !== 1) {
            console.log(`invalid ${id}: ${JSON.stringify(gs)}`)
            for (var group of groups) console.log(`group: ${JSON.stringify(group)}`)
            process.abort()
        }
        return gs[0]
    }

    // Import degrees
    write("> Degrees ")
    degrees = {}
    degreesByNewId = {}
    await Degree.deleteMany({}); // Drop all data
    results = await query('SELECT * FROM degrees');
    write(`caricamento ${ results.length } corsi di laurea...`);
    (await Promise.all(results.map(element => {
        const e = new Degree();
        e.old_id = element.id;
        e.name = element.name;
        e.academic_year = element.academic_year;
        e.years = element.years;
        e.enabled = element.enabled;
        e.enable_sharing = element.enable_sharing;
        const my_groups = {}
        groups
            .filter(g => g.degree_id===element.id)
            .forEach(g => {
                const exam_ids = exams_groups
                    .filter(eg => eg.group_id===g.id)
                    .map(eg => new ObjectId(exams[eg.exam_id]._id))
                my_groups[g.name] = exam_ids
            })

        e.groups = my_groups

        if (element.default_group_id) {
            e.default_group = group_by_id(element.default_group_id).name;
        } else {
            e.default_group = "";
        }
        e.approval_confirmation = element.approval_confirmation;
        e.rejection_confirmation = element.rejection_confirmation;
        e.submission_confirmation = element.submission_confirmation;
        e.approval_message = element.approval_message;
        e.rejection_message = element.rejection_message;
        e.submission_message = element.submission_message;
        e.free_choice_message = element.free_choice_message;
        return e.save();
    }))).map(d => {
        degrees[d.old_id] = d
        degreesByNewId[d._id] = d
    })
    write("(" + await count(Degree) + " documents imported)");

    write("| CurriculumExams")
    compulsory_exams = await query("SELECT * FROM compulsory_exams")
    compulsory_groups = await query("SELECT * FROM compulsory_groups")
    free_choice_exams = await query("SELECT * FROM free_choice_exams")

    // import curricula
    write("> Curricula")
    curricula = {}
    curriculaByNewId = {}
    await Curriculum.deleteMany({}) // Drop all data
    results = await query("SELECT * FROM curricula")
    write(`caricamento ${ results.length } curricula...`);
    (await Promise.all(results.map(element => {
        const e = new Curriculum();
        e.old_id = element.id;
        e.name = element.name
        e.notes = element.notes
        console.assert(element.credits_per_year.includes(","), element)
        const credits = element.credits_per_year.split(',').map(x => parseInt(x))
        console.assert(!credits.includes(NaN), credits, element);
        let years = credits.map(c => ({ credits: c, exams: []}))
        compulsory_exams.filter(e => (e.curriculum_id === element.id))
            .sort((a,b) => (b.position - a.position))
            .forEach(e => {
                years[e.year-1].exams.push(new CurriculumCompulsoryExam({
                    exam_id: exams[e.exam_id]._id
                    }))
            })
        compulsory_groups.filter(g => (g.curriculum_id === element.id))
            .sort((a,b) => (b.position - a.position))
            .map(g => {
                years[g.year-1].exams.push(new CurriculumCompulsoryGroup({
                    group: group_by_id(g.group_id).name
                }))
            })
        free_choice_exams.filter(e => (e.curriculum_id === element.id))
            .sort((a,b) => (b.position - a.position))
            .map(e => {
                if (e.group_id) {
                    years[e.year-1].exams.push(new CurriculumFreeChoiceGroup({
                        group: group_by_id(g.group_id).name
                    }))
                } else {
                    years[e.year-1].exams.push(new CurriculumFreeChoiceExam())
                }
            })
        e.years = years
        const degree = degrees[element.degree_id]
        e.degree_id = degree._id
        return e.save();
    }))).map(c => {
        curricula[c.old_id] = c
        curriculaByNewId[c._id] = c
    })

    write("| ProposalExams")
    chosen_exams = await query("SELECT * FROM chosen_exams")
    chosen_free_choice_exams = await query("SELECT * FROM chosen_free_choice_exams")

    write("| ProposalAuths")
    proposal_auths = await query("SELECT * FROM proposal_auths")

    // write("| Attachments")
    // attachments = await query(`SELECT * FROM attachments`)

    // import proposals
    write("> Proposals")
    await Proposal.deleteMany({}) // Drop all data
    results = await query("SELECT * FROM proposals")
    write(`caricamento ${results.length} proposals...`)

    await Promise.all(results.map(async element => {
        const p = {}

        p.old_id = element.id
        p.state = element.state

        const curriculum = curricula[element.curriculum_id]
        p.curriculum_id = curriculum._id
        p.curriculum_name = curriculum.name

        p.date_modified = element.modified
        p.date_submitted = element.submitted_date
        p.date_managed = element.approved_date

        const user = users[element.user_id]
        p.user_id = user._id
        p.user_last_name = user.last_name
        p.user_first_name = user.first_name
        p.user_name = user.name
        p.user_id_number = user.id_number
        p.user_email = user.email 
        p.user_username = user.username

        const degree = degreesByNewId[curriculum.degree_id]
        p.degree_id = degree._id
        p.degree_name = degree.name
        p.degree_academic_year = degree.academic_year

        p.exams = []

        chosen_exams.filter(e => (e.proposal_id === element.id))
        .forEach(e => {
            const year = e.chosen_year - 1
            exam = exams[e.exam_id]
            console.assert(e.exam_id === exam.old_id)   
            data = {
                exam_id: exam._id,
                exam_name: exam.name,
                exam_code: exam.code,
                exam_credits: exam.credits,
                // year: e.chosen_year,
            }
            if (p.exams[year] === undefined) {
                p.exams[year] = []
            }
            if (e.compulsory_exam_id) {
                p.exams[year].push(new ProposalCompulsoryExam({
                    ...data
                }))
            } else if (e.compulsory_group_id) {
                let candidates = compulsory_groups.filter(g => (
                    g.id === e.compulsory_group_id))
                if (candidates.length !== 1) {
                    console.log(`invalid compulsory_group_id ${e.compulsory_group_id}`)
                    console.log(`candidates: ${JSON.stringify(candidates)}`)
                    console.log(`element: ${JSON.stringify(element)}`)
                    for (var g of compulsory_groups) console.log(`${JSON.stringify(g)}`)
                    process.abort()
                }
                const group = candidates[0]
                const curriculum = curricula[group.curriculum_id]
                if (group.curriculum_id !== curriculum.old_id) {
                    console.log(`${e.curriculum_id} !== ${element.curriculum_id.old_id}`)
                    process.abort()
                }
                p.exams[year].push(new ProposalCompulsoryGroup({
                    ...data,
                    group: group_by_id(group.group_id).name
                }))
            } else if (e.free_choice_exam_id) {
                p.exams[year].push(new ProposalFreeChoiceExam({
                    ...data
                }))
            } else {
                p.exams[year].push(new ProposalFreeChoiceExam({
                    ...data
                }))
            }
        })

        chosen_free_choice_exams.filter(e => (e.proposal_id === element.id))
            .forEach(e => {
                const year = e.chosen_year - 1
                if (p.exams[year] === undefined) {
                    p.exams[year] = []
                }
                p.exams[e.chosen_year - 1].push(new ProposalExternalExam({
                    exam_name: e.name,
                    exam_credits: e.credits,
                    // year: e.chosen_year,
                }))
            })

        p.attachments = []

        proposal_auths.filter(pa => (pa.proposal_id === element.id))
            .forEach(pa => {
                p.attachments.push(new ProposalAuthAttachment({
                    email: pa.email,
                    secret: pa.secret,
                    date_created: pa.created
                }))
            })

        if (LOAD_ATTACHMENTS) {
            q = await query(`SELECT * FROM attachments WHERE proposal_id=${element.id}`)
            q.forEach(a => {
                    console.log(`attachment size: ${a.data?.length}`)
                    if (a.filename) {
                        p.attachments.push(new ProposalFileAttachment({
                            filename: a.filename,
                            data: a.data,
                            mimetype: a.mimetype,
                            comment: a.comment,
                            date_created: a.date
                        }))
                    } else {
                        p.attachments.push(new ProposalCommentAttachment({
                            comment: a.comment,
                            date_created: a.date
                        }))
                    }
                })
        }

        p.attachments.sort((a,b) => {
            if (a.date_created < b.date_created) return 1
            if (a.date_created === b.date_created) return 0
            return -1
        })
        return new Proposal(p).save()
    }))

    // Temporaneo, solo per creare la collezione. Da sostituire con
    // l'effettiva migrazione degli allegati
    Attachment.createCollection();
    Comment.createCollection();

    // import form_templates
    write("> Form templates")
    await FormTemplate.deleteMany({}) // Drop all data
    results = await query("SELECT * FROM form_templates")
    write(`caricamento ${ results.length } form_templates...`)
    form_templates = {};
    (await Promise.all(results.map(element => {
        const e = {}
        e.old_id = element.id
        e.name = element.name
        e.text = element.text.replace(/\{(.*?)\}/g,'<var>$1</var>')
        e.enabled = element.enabled
        e.require_approval = element.require_approval
        e.notify_emails = element.notify_emails
            .split(',')
            .map(x => x.trim())

        return new FormTemplate(e).save()
    }))).forEach(f => { form_templates[f.old_id] = f})

    // import forms
    write("> Forms")
    await Form.deleteMany({}) // Drop all data
    results = await query("SELECT * FROM forms")
    write(`caricamento ${results.length} forms...`)
    await Promise.all(results.map(element => {
        const e = {}
        const user = users[element.user_id]
        const form_template = form_templates[element.form_template_id]
        e.old_id = element.id
        e.form_template_id = form_template
        e.form_template_name = form_template.name
        e.user_id = user._id
        e.user_last_name = user.last_name
        e.user_first_name = user.first_name
        e.user_id_number = user.id_number
        e.user_email = user.email
        e.user_username = user.username
        e.state = element.state
        e.date_modified = element.modified
        e.date_submitted = element.submitted_date
        e.date_managed = element.approved_date
        e.data = JSON.parse(element.data)

        return new Form(e).save()
    }))

    await mongoose.connection.close()
    connection.end();
}

write("Starting the import of the data from MySQL to MongoDB")
importData().then((res) => write("Import done"));
