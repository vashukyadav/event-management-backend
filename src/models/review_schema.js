import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    user_Id:{
        type:mongoose.Schema.Types.ObjectId,
       ref:'User',
       required:true
    },
    vendor_Id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Vendor',
        required:true
    },
    rating:{
        type:Number,
        

    },
    comment:{
        type:String,


    }
 
});     

export default mongoose.model('Review', reviewSchema);