const mongoose = require('mongoose');

module.exports = mongoose.model('Inventory', {
    user_id: String,
	items: Array
});
