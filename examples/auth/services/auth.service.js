import {generateToken} from '../providers/jwt.js'

export default class AuthService{
    static proto = "auth.proto";

    static async token(input){
        return {schema: "Bearer", token: generateToken(input), role: 1};
    }

    static async getUser(){
        return this.user;
    }
}
