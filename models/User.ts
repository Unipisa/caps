import mongoose from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';

interface IUser extends mongoose.Document {
  old_id?: number;
  username: string;
  name?: string;
  id_number?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  admin: boolean;
}

const userSchema = new mongoose.Schema<IUser>({
    old_id: {
        type: Number,
        required: false
    },
    username: {
        type: String,
        required: true
    },
    name: {
        type: String
    },
    id_number: {
        type: String
    },
    first_name: {
        type: String
    },
    last_name: {
        type: String
    },
    email: {
        type: String
    },
    admin: {
        type: Boolean,
        required: true,
        default: false
    },
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model<IUser>('User', userSchema);

export default User;
