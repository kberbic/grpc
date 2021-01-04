import mongoose from 'mongoose';

const CompanySchema = new mongoose.Schema(
    {
        name: String,
        address: String,
        maxEmployees: Number,
        userId: String
    }, {
        timestamps: true,
        collection: "companies"
    }
);

const CompanyModel = mongoose.model('Company', CompanySchema);
export default CompanyModel;
