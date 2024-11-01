const mongoose = require("mongoose");

const uri = "mongodb+srv://shallot38hk:o1D3V48wQyBiXUFW@cluster0.4vigwt9.mongodb.net/khach_san_haven_inn" ;

const connect = async () => {
    try{
        await mongoose.connect(uri);
        console.log('connect success')
    }catch(err){
        console.log(err);
        console.log('connect fail')
    }
}

module.exports = {connect}