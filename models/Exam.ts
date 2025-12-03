import mongoose from 'mongoose';
import { required, isNotEmpty, minVal } from './Validators';

interface IExam extends mongoose.Document {
  old_id?: number;
  name: string;
  code?: string;
  sector: string;
  credits: number;
  tags?: string[];
  notes?: string;
}

const ExamSchema = new mongoose.Schema<IExam>({
    old_id: {
        type: Number,
        required: false
    },
    name: {
        type: String,
        required: required("Nome"),
        validate: [isNotEmpty("Nome")]
    },
    code: {
        type: String,
        default: "",
        // required: required("Codice"),
        // validate: [isNotEmpty("Codice")]
    },
    sector: {
        type: String,
        required: required("Settore"),
        validate: [isNotEmpty("Settore")]
    },
    credits: {
        type: Number,
        required: required("Crediti"),
        validate: [minVal(1, "Crediti")]
    },
    tags: {
        type: [String],
        default: []
    },
    notes: {
        type: String,
        default: ""
    },
});

const Exam = mongoose.model<IExam>('Exam', ExamSchema);

export default Exam;