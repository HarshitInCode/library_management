const Book = require('../models/book');
const { UnauthenticatedError, BadRequestError } = require('../errors');

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
        throw new BadRequestError('Failed to retrieve books');
    }
};

// Add a book (accessible only to admin)
const addBook = async (req, res) => {
    const user = req.user;

    if (!user || user.role !== 'admin') {
        throw new UnauthenticatedError('Only admins can add books');
    }

    try {
        const { title, author, publication_year, genre, total_copies } = req.body;

        // Update the condition to check if req.files is falsy or does not contain the necessary information
        if (!req.files || !req.files.image || !req.files.image[0].filename) {
            throw new BadRequestError('Please provide an image for the book');
        }

        const image = req.files.image[0].filename;
        const pdfFile = req.files.pdfFile ? req.files.pdfFile[0].filename : null;

        const newBook = await Book.create({ title, author, publication_year, genre, total_copies, image, pdfFile });

        res.status(201).json({
            msg: 'Book added successfully',
            book: newBook,
        });
    } catch (error) {
        console.error('Error adding book:', error);
        return res.status(500).json({ msg: 'Failed to add book. Please check your data and try again.' });
    }
};

// Get a specific book by ID (accessible to admin)
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
        throw new BadRequestError('Failed to retrieve book');
    }
};

// Update a book by ID (accessible only to admin)
const updateBook = async (req, res) => {
    const user = req.user;

    if (!user || user.role !== 'admin') {
        throw new UnauthenticatedError('Only admins can update books');
    }

    try {
        const bookId = req.params.bookId;
        const existingBook = await Book.findById(bookId);

        if (!existingBook) {
            return res.status(404).json({
                msg: 'Book not found',
            });
        }

        existingBook.title = req.body.title || existingBook.title;
        existingBook.author = req.body.author || existingBook.author;
        existingBook.publication_year = req.body.publication_year || existingBook.publication_year;
        existingBook.genre = req.body.genre || existingBook.genre;
        existingBook.total_copies = req.body.total_copies || existingBook.total_copies;

        // Check if 'image' field is present in the request
        if (req.files && req.files.image) {
            existingBook.image = req.files.image[0].filename;
        }

        // Check if 'pdfFile' field is present in the request
        if (req.files && req.files.pdfFile) {
            existingBook.pdfFile = req.files.pdfFile[0].filename;
        }

        const updatedBook = await existingBook.save();

        res.status(200).json({
            msg: 'Book updated successfully',
            book: updatedBook,
        });
    } catch (error) {
        console.error('Error updating book:', error.message);
        throw new BadRequestError('Failed to update book');
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
        throw new BadRequestError('Failed to delete book');
    }
};





module.exports = { addBook, getBooks, getBookById, updateBook, deleteBook };
