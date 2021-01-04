import InvalidArgumentsError from '../errors/invalidarguments.error.js';
import UnauthenticatedError from '../errors/unauthenticated.error.js';
import db from '../models/index.js';
import {generateToken} from '../providers/jwt.js';

export default class authService {
    static proto = 'auth.proto';

    static async create(company) {
      const exist = await db.User.findOne({email: user.email}, "_id").lean();
      if(exist)
          throw new InvalidArgumentsError("USER_ALREADY_EXIST");

      user.password = db.User.generateHash(user.password);
      const output = await (new db.User(user).save());
      return { id: output._id.toString() };
    }

    static async login(user) {
        const dbUser = await db.User.findOne({email: user.email}, "_id name email password");
        if (!dbUser || !dbUser.validPassword(user.password))
            throw new UnauthenticatedError("INVALID_USERNAME_OR_PASSWORD");

        const output = {id: dbUser._id, email: dbUser.email, name: dbUser.name};
        return {id: dbUser._id, token: generateToken(output)};
    }

    static async profile() {
        const user = await db.User.findOne({_id: this.user.id}, "_id name email").lean();
        return {id: user._id, name: user.name, email: user.email};
    }
}
