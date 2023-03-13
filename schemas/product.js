const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    relative_id: {
        mercadona: String
    },
    allergens: String,
    brand: String,
    description: String,
    display_name: String,
    ean: String,
    ingredients: String,
    thumbnails: String
});

module.exports = mongoose.model('Product', productSchema);