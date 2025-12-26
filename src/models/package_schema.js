import mongoose from "mongoose";


const packageSchema = new mongoose.Schema({
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    eventType: {
        type: String,
        enum: ["wedding", "birthday", "corporate", "anniversary", "others"],
        required: true
    }
    ,
    price: {
        type: Number,
        required: true,
    },
    includes: {
        type: [String],
        required: true
    },
    images: {
        type: [String],
    },
    minBudget: {
        type: Number,
        required: true,
    },
    maxBudget: {
        type: Number,
        required: true,
    }
}, { timestamps: true });

const Package = mongoose.model("Package", packageSchema);

export default Package;   // ⭐⭐⭐ IMPORTANT