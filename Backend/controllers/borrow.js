require('dotenv').config();
const Book = require('../models/book');
const Auth = require('../models/auth')
const { UnauthenticatedError } = require('../errors');
const Borrow = require('../models/borrow');
const nodemailer = require('nodemailer');
const fs = require('fs').promises; 

const borrowBook = async (req, res) => {
    const user = req.user;
    const bookDetails = req.body;

    try {
        const existingBook = await Book.findById(bookDetails.book_id);
        const existingBorrowsByUser = await Borrow.find({
            'borrowed_by.user_id': user.userId,
            borrowed: true,
        });

        if (!existingBook) {
            return res.status(404).json({
                msg: 'Book not found in the library',
            });
        }

        if (existingBorrowsByUser.length >= 3) {
            return res.status(400).json({
                msg: 'User can only borrow up to three books at a time',
            });
        }

        const existingBorrow = await Borrow.findOne({
            book_id: bookDetails.book_id,
            borrowed: true,
        });

        if (existingBorrow) {
            if (
                existingBorrow.borrowed_by &&
                existingBorrow.borrowed_by.user_id.toString() === user.userId.toString()
            ) {
                return res.status(400).json({
                    msg: 'Book is already borrowed by the same user',
                });
            }
        }

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

        const newBorrow = new Borrow(bookDetails);
        await newBorrow.save();

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
    const requestedSearchTerm = req.query.search;

    try {
        if (user && user.role === 'admin') {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const baseQuery = {};

            if (requestedSearchTerm) {
                baseQuery.$or = [
                    { 'borrowed_by.name': { $regex: new RegExp(requestedSearchTerm, 'i') } },
                    { 'title': { $regex: new RegExp(requestedSearchTerm, 'i') } },
                    { 'author': { $regex: new RegExp(requestedSearchTerm, 'i') } },
                    { 'genre': { $regex: new RegExp(requestedSearchTerm, 'i') } }
                ];
            }

            const totalCount = await Borrow.countDocuments(baseQuery);

            const allBorrowList = await Borrow.find(baseQuery)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit);

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

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL_EMAIL,
        pass: process.env.MAIL_SECRET,
    },
});

const sendReminderEmail = async (req, res) => {
    const borrowId = req.body.borrowId;
    const userId = req.body.userId;

    try {
        const borrowEntry = await Borrow.findById(borrowId);
        const userEntry = await Auth.findById(userId);

        const path = require('path');
        const htmlContent = await fs.readFile(path.join(__dirname, '../mail/index.html'), 'utf8');

        const placeholders = {
            readerName: borrowEntry.borrowed_by.name,
            bookTitle: borrowEntry.title,
            author: borrowEntry.author,
            genre: borrowEntry.genre,
            publicationYear: borrowEntry.publication_year,
            borrowedDate: borrowEntry.borrowed_date.toDateString(),
        };

        const replacedHtmlContent = htmlContent.replace(/\${([^}]+)}/g, (match, p1) => {
            return placeholders[p1] || match; // Use the placeholder value or keep the original placeholder if not found
        });

        if (!borrowEntry) {
            return res.status(404).json({
                msg: 'Borrow entry not found for the provided borrow_id',
            });
        }

        if (!userEntry) {
            return res.status(404).json({
                msg: 'User Not Found',
            });
        }
        console.log(userEntry.email);

        const mailOptions = {
            from: process.env.MAIL_EMAIL,
            to: userEntry.email,
            subject: 'Reminder: Return Overdue Book',
            html: replacedHtmlContent,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({
            msg: 'Reminder email sent successfully',
        });
    } catch (error) {
        console.error('Error sending reminder email:', error.message);
        res.status(500).json({
            msg: 'Internal server error',
        });
    }
};


module.exports = { sendReminderEmail };




module.exports = { borrowBook, returnBook, getBorrowedList, getAllBorrowList, getBookDetails, sendReminderEmail };