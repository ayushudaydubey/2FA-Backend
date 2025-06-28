import mongoose from  'mongoose'

export  function connectDB () {
  mongoose.connect(process.env.MONGO_DB_URL)
  .then(()=>{
    console.log("DB connected ")
    
  })
  .catch((err)=>{
    console.log("ERROR--->",err);
    
  })


}