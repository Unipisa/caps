import mongoose from 'mongoose';
import Exam from './Exam';

interface IDegree extends mongoose.Document {
  old_id?: number;
  name: string;
  academic_year: number;
  years: number;
  groups: Map<string, mongoose.Types.ObjectId[]>;
  enabled: boolean;
  sharing_mode: string;
  default_group?: string;
  approval_confirmation: boolean;
  rejection_confirmation: boolean;
  submission_confirmation: boolean;
  approval_message?: string;
  rejection_message?: string;
  submission_message?: string;
  free_choice_message?: string;
}

const DegreeSchema = new mongoose.Schema<IDegree>({
    old_id: {
        type: Number,
        required: false
    },
    name: {
        type: String,
        required: true
    },
    academic_year: {
        type: Number,
        required: true
    },
    years: {
        type: Number,
        required: true,
        default: 3
    },
    groups: {
        type: Map,
        of: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: Exam
                }
            ],
        default: () => new Map()
    },
    enabled: {
        type: Boolean,
        required: true,
        default: false
    },
    sharing_mode: {
        type: String,
        required: true,
        default: "disabled",
        enum: ["disabled", "enabled", "admin"]
    },
    default_group: String,
    approval_confirmation: {
        type: Boolean,
        required: true,
        default: true
    },
    rejection_confirmation: {
        type: Boolean,
        required: true,
        default: true
    },
    submission_confirmation: {
        type: Boolean,
        required: true,
        default: true
    },
    approval_message: {
        type: String,
        required: false,
        default: ""
    },
    rejection_message: {
        type: String,
        required: false,
        default: ""
    },
    submission_message: {
        type: String,
        required: false,
        default: ""
    },
    free_choice_message: {
        type: String,
        required: false,
        default: ""
    },
});

const Degree = mongoose.model<IDegree>('Degree', DegreeSchema);

export default Degree;