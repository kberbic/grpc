import mongoose from 'mongoose';
import bcrypt from 'bcrypt-nodejs';

const UserSchema = new mongoose.Schema(
    {
        name: String,
        email: String,
        password: String,
    }, {
        timestamps: true,
        collection: "users"
    }
);

UserSchema.methods.validPassword = function(password) {
    if (!this.password)
        return false;

    return bcrypt.compareSync(password, this.password);
};

UserSchema.statics.generateHash = (password)=> bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);

const UserModel = mongoose.model('User', UserSchema);
export default UserModel;
