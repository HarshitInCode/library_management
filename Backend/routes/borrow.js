const express = require('express');
const router = express.Router();

const { borrowBook, returnBook, getBorrowedList, getAllBorrowList, getBookDetails } = require('../controllers/borrow');

// Get All borrowed and Return books to admin
router.get('/all-books', getAllBorrowList);

// Route for borrowing a book
router.post('/', borrowBook);

// Route for returning a book
router.post('/return/:bookId', returnBook);

// Get borrowed books based on user ID
router.get('/borrowed-books/:userId', getBorrowedList);

router.get('/details/:bookId', getBookDetails);

module.exports = router;
