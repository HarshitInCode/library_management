const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a title'],
    },
    author: {
        type: String,
        required: [true, 'Please provide an author'],
    },
    publication_year: {
        type: String,
        required: [true, 'Please provide a publication year'],
    },
    genre: {
        type: String,
        enum: ['Fiction', 'Non-Fiction', 'Mystery', 'Science Fiction', 'Fantasy', 'Thriller', 'Romance', 'Other'],
        required: [true, 'Please provide a genre name'],
    },
    total_copies: {
        type: Number,
        required: [true, 'Please provide a total number of copies'],
    },
    available_copies: {
        type: Number,
        required: [true, 'Please provide the available copies'],
        default: function () {
            return this.total_copies;
        },
    },
}, { timestamps: true });

module.exports = mongoose.model('library_Books', BookSchema);
