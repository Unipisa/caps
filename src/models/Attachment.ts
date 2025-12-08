import mongoose from 'mongoose';

interface IAttachment extends mongoose.Document {
  filename?: string;
  mimetype?: string;
  encoding?: string;
  uploader_id: mongoose.Types.ObjectId;
  size?: number;
  content?: string; // è un id ma NON è un ObjectId di mongo
}

const attachmentSchema = new mongoose.Schema<IAttachment>({
    filename: {
        type: String
    },
    mimetype: {
        type: String
    },
    encoding: {
        type: String
    },
    uploader_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    size: {
        type: Number
    },
    content: {
        type: String    // è un id ma NON è un ObjectId di mongo
    }
}, { timestamps: true });

const Attachment = mongoose.models.Attachment || mongoose.model<IAttachment>('Attachment', attachmentSchema);

export default Attachment;