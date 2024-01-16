const Book = require('../models/book');
const { UnauthenticatedError } = require('../errors');
const Borrow = require('../models/borrow');

const borrowBook = async (req, res) => {
    const user = req.user;

    const bookDetails = req.body;

    try {
        // Check if the book exists in the library_Books collection
        const existingBook = await Book.findById(bookDetails.book_id);
        const existingBorrow = await Borrow.findOne({
            book_id: bookDetails.book_id,
            borrowed: true,
        });

        if (!existingBook) {
            return res.status(404).json({
                msg: 'Book not found in the library',
            });
        }

        // Check if the book is already borrowed
        if (existingBorrow && existingBorrow.borrowed) {
            // Check if the book is borrowed by the same user
            if (
                existingBorrow.borrowed_by &&
                existingBorrow.borrowed_by.user_id.toString() === user.userId.toString()
            ) {
                return res.status(400).json({
                    msg: 'Book is already borrowed by the same user',
                });
            }
        }

        // Set default values and user information in borrowed_by
        const currentDate = new Date();
        bookDetails.total_copies = existingBook.total_copies;
        bookDetails.available_copies = existingBook.total_copies - 1;
        bookDetails.borrowed = true;
        bookDetails.borrowed_by = {
            name: user.name,
            user_id: user.userId,
        };
        bookDetails.return_date = null;
        bookDetails.borrowed_date = currentDate;

        // Create a new Borrow entry
        const newBorrow = new Borrow(bookDetails);
        await newBorrow.save();

        // Update the book to mark it as borrowed
        existingBook.borrowed = true;
        existingBook.available_copies -= 1;
        existingBook.save();

        res.status(200).json({
            msg: 'Book borrowed successfully',
            borrowEntry: newBorrow,
        });
    } catch (error) {
        console.error('Error borrowing book:', error.message);
        res.status(500).json({
            msg: 'Internal server error',
        });
    }
};

const returnBook = async (req, res) => {
    const userId = req.user.userId;
    const bookId = req.params.bookId;


    try {
        const borrowEntry = await Borrow.findOne({
            book_id: bookId,
            'borrowed_by.user_id': userId,
            borrowed: true,
        });



        if (!borrowEntry) {
            console.error('Borrow entry not found:', bookId, userId);
            return res.status(404).json({
                msg: 'Book not found in borrow records or not currently borrowed',
            });
        }

        borrowEntry.borrowed = false;
        borrowEntry.return_date = new Date();

        await borrowEntry.save();

        const existingBook = await Book.findById(bookId);
        if (existingBook) {
            existingBook.borrowed = false;
            existingBook.available_copies += 1;
            await existingBook.save();
        } else {
            console.error('Book not found:', bookId);
        }

        res.status(200).json({
            msg: 'Book returned successfully',
            borrowEntry: {
                borrowed: borrowEntry.borrowed,
                return_date: borrowEntry.return_date,
                available_copies: borrowEntry.available_copies + 1,
            },
        });
    } catch (error) {
        console.error('Error returning book:', error.message);
        res.status(500).json({
            msg: 'Internal server error',
        });
    }
};

const getBorrowedList = async (req, res) => {
    const userId = req.user.userId;

    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const totalCount = await Borrow.countDocuments({
            'borrowed_by.user_id': userId,
            borrowed: true,
        });

        const borrowList = await Borrow.find({
            'borrowed_by.user_id': userId,
            borrowed: true,
        })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ createdAt: -1 });

        res.status(200).json({
            msg: 'Borrowed books retrieved successfully',
            borrowList: borrowList,
            totalCount: totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
        });
    } catch (error) {
        console.error('Error fetching borrowed books:', error.message);
        res.status(500).json({
            msg: 'Internal server error',
        });
    }
};


const getAllBorrowList = async (req, res) => {
    const user = req.user;

    try {
        if (user && user.role === 'admin') {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            const totalCount = await Borrow.countDocuments();

            const allBorrowList = await Borrow.find()
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .sort({ createdAt: -1 });

            res.status(200).json({
                msg: 'All borrow data retrieved successfully',
                borrowList: allBorrowList,
                totalCount: totalCount,
                totalPages: Math.ceil(totalCount / limit),
                currentPage: page,
            });
        } else {
            res.status(403).json({
                msg: 'Access forbidden. Admin role required.',
            });
        }
    } catch (error) {
        console.error('Error fetching all borrow data:', error);
        res.status(500).json({
            msg: 'Internal server error',
        });
    }
};


const getBookDetails = async (req, res) => {
    const userId = req.user.userId;
    const bookId = req.params.bookId;

    try {
        const borrowEntry = await Borrow.findOne({
            book_id: bookId,
            'borrowed_by.user_id': userId,
            borrowed: true,
        });

        if (!borrowEntry) {
            return res.status(404).json({
                msg: 'Book not found in borrow records or not currently borrowed',
            });
        }

        res.status(200).json({
            msg: 'Book details retrieved successfully',
            borrowEntry: borrowEntry,
        });
    } catch (error) {
        console.error('Error getting book details:', error.message);
        res.status(500).json({
            msg: 'Internal server error',
        });
    }
};


module.exports = { borrowBook, returnBook, getBorrowedList, getAllBorrowList, getBookDetails };
