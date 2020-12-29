export default class CompanyService{
    static proto = "company.proto";

    static async getCompany(context){
        return {id: 1, name:"Company"};
    }
}