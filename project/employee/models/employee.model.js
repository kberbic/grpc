import mongoose from 'mongoose';

const EmployeeSchema = new mongoose.Schema(
    {
        name: String,
        address: String,
        companyId: String,
        userId: String,
        company: JSON
    }, {
        timestamps: true,
        collection: "employees"
    }
);

const EmployeeModel = mongoose.model('Employee', EmployeeSchema);
export default EmployeeModel;
