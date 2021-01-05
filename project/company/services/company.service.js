import db from '../models/index.js';
import NotFoundError from '../errors/notfound.error.js';

export default class companyService {
    static proto = 'company.proto';

    static async create(company) {
        const output = await (new db.Company({userId: this.user.id, ...company})).save();
        return {id: output._id};
    }

    static async update(company) {
        const exist = await db.Company.findOne({_id: company.id, userId: this.user.id}).lean();
        if(!exist)
            throw new NotFoundError("COMPANY_DOES_NOT_EXIST");

        await db.Company.update({_id: company.id}, company);
        return {id: company.id};
    }

    static async get({id}) {
        const company = await db.Company.findOne({_id: id, userId: this.user.id}).lean();
        if(!company)
            throw new NotFoundError("COMPANY_DOES_NOT_EXIST");

        return {
            id: company._id.toString(),
            ...company
        };
    }

    static async delete({id}) {
        const company = await db.Company.remove({_id: id, userId: this.user.id});
        return {id};
    }
}
