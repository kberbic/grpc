import mongoose from 'mongoose';

const TestSchema = new mongoose.Schema(
    {
        name: String
    }, {
        timestamps: true,
        collection: "tests"
    }
);

const TestModel = mongoose.model('Test', TestSchema);
export default TestModel;
