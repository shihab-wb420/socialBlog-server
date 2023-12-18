import mongoose from "mongoose";

const connectDB = async ()=>{ 
  try{
    const cnn = await mongoose.connect(process.env.MONGODB_URI); 
    console.log(`\n Mongodb connected🙂 !! DB host : ${cnn.connection.host} `);
  }catch(error){
    console.log("Mongodb connection Faild🥲",error);
    process.exit(1);
  }
}; 

export default  connectDB;