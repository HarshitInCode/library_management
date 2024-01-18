const express = require('express');
const router = express.Router();
const { storage } = require('../helper/multer');
const multer = require('multer');
const { upload } = require('../helper/multer');
const { addBook, getBooks, getBookById, updateBook, deleteBook } = require('../controllers/book');

// Add a book
router.post('/', upload.single('image'), addBook);

// Get all books
router.get('/', getBooks);

// Get a specific book by ID
router.get('/:bookId', getBookById);

// Update a book by ID
router.put('/:bookId', updateBook);

// Delete a book by ID
router.delete('/:bookId', deleteBook);

module.exports = router;
