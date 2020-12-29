import GRPCClient from "../clients/grpc.js";

export default class UserService{
    static proto = "user.proto";

    static async getUser(){
        console.log(this.metadata)
        return {id: 1, name:"kenan"};
    }

    static async getUsers(context){
        return {users: [{id: 1, name:"kenan"}]};
    }
}