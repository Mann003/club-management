const mongoose = require("mongoose");

const pictureSchema = mongoose.Schema({
    club:{
        type: String,
    },
    imageurl: {
        type: String,
    }
})

const pictures = mongoose.model("pictures", pictureSchema);

module.exports = pictures