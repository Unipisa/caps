
const mongoose = require('mongoose');

const CurriculumExam = mongoose.Schema({}, { discriminatorKey: 'kind' });

const CurriculumCompulsoryExam = CurriculumExam.discriminator("CompulsoryExam",
    {
        exam: {
            type: ObjectId,
            ref: Exam
        }
    })

const CurriculumCompulsoryGroup = CurriculumExam.discriminator("CompulsoryGroup",
    {
        group: {
            type: ObjectId,
            ref: Group
        }
    }
)

const Curriculum = mongoose.model('Curriculum', {
    old_id: {
        type: Number,
        required: false
    },
    name: { 
        type: String, 
        required: true
    },
    notes: {
        type: String,
        required: false,
    },
    degree: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Degree'
    },
    years: [
        {
            credits: Number,
            exams: [
                compulsory_exam: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Exam',
                    required: false
                },
            ]
        }
    ]

})

module.exports = Degree;