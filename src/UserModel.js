const mongoose = require('mongoose');

module.exports = mongoose.model('User', {
    name: String,
    _id: String,
    color: String,
    flags: Object
});
