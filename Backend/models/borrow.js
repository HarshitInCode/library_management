const mongoose = require('mongoose');

const BorrowSchema = new mongoose.Schema({
    book_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'library_Books',
        required: [true, 'Please provide the Book ID'],
    },
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
        required: [true, 'Please provide a genre name'],
    },
    total_copies: {
        type: Number,
        required: [true, 'Please provide a total number of copies'],
    },
    available_copies: {
        type: Number,
        required: [true, 'Please provide the available copies'],
    },
    borrowed: {
        type: Boolean,
        required: [true, 'Please provide the borrowed status'],
    },
    borrowed_by: {
        name: {
            type: String,
            default: '',
        },
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'library_auth',
            default: null,
        },
    },
    return_date: {
        type: Date,
        default: null,
    },
    borrowed_date: {
        type: Date,
        default: null,
    },
}, { timestamps: true });

module.exports = mongoose.model('library_Borrow', BorrowSchema);
