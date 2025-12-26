import  mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    package_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Package',
        required: true
    },
    eventType:{
       type:mongoose.Schema.Types.ObjectId,
       ref: 'Package',
       required:true

    },
    eventDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled'],
        default: 'pending'
    },
    totalAmount:{
        type:Number,
        required:true
    }
});

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking; // ⭐⭐⭐ VERY IMPORTANT