const Book = require('../models/book');
const { UnauthenticatedError } = require('../errors');

// Get all books (accessible to everyone)
const getBooks = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;


        const totalCount = await Book.countDocuments();
        const books = await Book.find()
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ createdAt: -1 });
        res.status(200).json({
            msg: 'Books retrieved successfully',
            books: books,
            totalCount: totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
        });
    } catch (error) {
        console.error('Error retrieving books:', error.message);
        throw new UnauthenticatedError('Failed to retrieve books');
    }
};

// Add a book (accessible only to admin)
const addBook = async (req, res) => {

    const user = req.user;
    if (!user || user.role !== 'admin') {
        throw new UnauthenticatedError('Only admins can add books');
    }

    try {

        const newBook = await Book.create({ ...req.body });


        res.status(201).json({
            msg: 'Book added successfully',
            book: newBook,
        });
    } catch (error) {
        console.error('Error adding book:', error.message);
        throw new UnauthenticatedError('Failed to add book');
    }
};

// Get a specific book by ID (accessible to everyone)
const getBookById = async (req, res) => {
    try {

        const book = await Book.findById(req.params.bookId);

        if (!book) {
            return res.status(404).json({
                msg: 'Book not found',
            });
        }

        res.status(200).json({
            msg: 'Book retrieved successfully',
            book: book,
        });
    } catch (error) {
        console.error('Error retrieving book:', error.message);
        throw new UnauthenticatedError('Failed to retrieve book');
    }
};

// Update a book by ID (accessible only to admin)
const updateBook = async (req, res) => {

    const user = req.user;
    if (!user || user.role !== 'admin') {
        throw new UnauthenticatedError('Only admins can update books');
    }

    try {

        const updatedBook = await Book.findByIdAndUpdate(req.params.bookId, { ...req.body }, { new: true });

        if (!updatedBook) {
            return res.status(404).json({
                msg: 'Book not found',
            });
        }

        res.status(200).json({
            msg: 'Book updated successfully',
            book: updatedBook,
        });
    } catch (error) {
        console.error('Error updating book:', error.message);
        throw new UnauthenticatedError('Failed to update book');
    }
};

// Delete a book by ID (accessible only to admin)
const deleteBook = async (req, res) => {

    const user = req.user;
    if (!user || user.role !== 'admin') {
        throw new UnauthenticatedError('Only admins can delete books');
    }

    try {

        const deletedBook = await Book.findByIdAndDelete(req.params.bookId);

        if (!deletedBook) {
            return res.status(404).json({
                msg: 'Book not found',
            });
        }

        res.status(200).json({
            msg: 'Book deleted successfully',
            book: deletedBook,
        });
    } catch (error) {
        console.error('Error deleting book:', error.message);
        throw new UnauthenticatedError('Failed to delete book');
    }
};





module.exports = { addBook, getBooks, getBookById, updateBook, deleteBook };
