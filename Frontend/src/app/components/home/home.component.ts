import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { forkJoin } from 'rxjs';
import { ChangeDetectionStrategy } from '@angular/core';
import { NgxSpinnerService } from "ngx-spinner";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
  bookForm: FormGroup | undefined;
  role: any;
  showReturnButton: boolean = false;
  book_id: string = '';
  title: string = '';
  private userId: string = ''
  numberItemsSelected = 0;
  tableData: any[] = [];
  modifiedTableData: any[] = [];
  itemsPerPage = 10;
  currentPage = 1;
  totalPages = 1;
  totalItems = 0;
  currentItemsRange: string = '';
  isGenreDropdownOpen: boolean = false;


  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private authService: AuthService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit() {
    const user = this.authService.getUser();
    this.userId = user.userId;
    this.role = user.role;
    this.bookForm = this.fb.group({
      title: ['', Validators.required],
      author: ['', Validators.required],
      publication_year: ['', [Validators.required]],
      genre: ['', Validators.required],
      total_copies: ['', [Validators.required]],
      image: [null, Validators.required]
    });
    this.getAllData();
  }

  getAllData() {
    this.spinner.show();
    forkJoin([
      this.apiService.getBooks(this.currentPage, this.itemsPerPage),
      this.apiService.getBorrowedBooksforUser(this.userId),
    ]).subscribe(
      ([booksResponse, borrowedBooks]) => {
        this.tableData = booksResponse.books;
        this.totalItems = booksResponse.totalCount;
        this.totalPages = booksResponse.totalPages;
        this.updateCurrentItemsRange();

        if (Array.isArray(borrowedBooks.borrowList)) {
          const updatedTableData = this.tableData.slice();
          borrowedBooks.borrowList.forEach((borrowedBook: any) => {
            const index = updatedTableData.findIndex((book) => book._id === borrowedBook.book_id);
            if (index !== -1) {
              updatedTableData[index] = borrowedBook;
            }
          });
          this.modifiedTableData = updatedTableData;
          this.cdr.detectChanges();
          this.spinner.hide()
        }
      },
      (error) => {
        console.error(error);
        this.spinner.hide()
      }
    );
  }

  clearFormData() {
    if (this.bookForm) {
      this.bookForm.reset();
    }
  }


  updateCurrentItemsRange() {
    if (this.currentPage && this.totalPages) {
      const startItem = (this.currentPage - 1) * this.itemsPerPage + 1;
      const endItem = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
      this.currentItemsRange = `${startItem}-${endItem} / ${this.totalItems} items`;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.getAllData();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.getAllData();
    }
  }

  DeleteBook(bookId: string) {
    this.apiService.deleteBook(bookId).subscribe(
      (res) => {
        this.toastr.success('Book deleted successfully');
        this.getAllData();
      },
      (error) => {
        const errorMessage =
          error.error && error.error.msg
            ? error.error.msg
            : 'An error occurred';
        this.toastr.error(errorMessage);
      }
    );
  }

  UpdateBook(bookId: string) {
    this.spinner.show()
    this.book_id = bookId
    this.apiService.getBookById(bookId).subscribe(
      (res) => {
        const bookDetails = res.book;
        this.bookForm?.patchValue({
          title: bookDetails.title,
          author: bookDetails.author,
          publication_year: bookDetails.publication_year,
          genre: bookDetails.genre,
          total_copies: bookDetails.total_copies,
        });
        this.spinner.hide()
      },
      (error) => {
        const errorMessage =
          error.error && error.error.msg
            ? error.error.msg
            : 'An error occurred';
        this.toastr.error(errorMessage);
        this.spinner.hide()
      }
    );
  }

  borrow(item: any) {
    this.spinner.show();
    const borrowData = {
      book_id: item._id,
      title: item.title,
      author: item.author,
      publication_year: item.publication_year,
      genre: item.genre,
      total_copies: item.total_copies
    };

    this.apiService.borrowBook(borrowData).subscribe(
      (res) => {
        this.toastr.success(res.msg);
        this.getAllData();
        this.spinner.hide();
      },
      (error) => {
        const errorMessage =
          error.error && error.error.msg
            ? error.error.msg
            : 'An error occurred';
        this.toastr.error(errorMessage);
        this.spinner.hide();
      }
    );
  }

  return(bookId: string) {
    this.spinner.show();
    this.apiService.returnBook(bookId).subscribe((res) => {
      this.toastr.success(res.msg);
      this.getAllData();
      this.spinner.hide();
    },
      (error) => {
        const errorMessage =
          error.error && error.error.msg
            ? error.error.msg
            : 'An error occurred';
        this.toastr.error(errorMessage);
        this.spinner.hide();
      })
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    console.log(file);

    this.bookForm?.get('image')?.setValue(file.name);
  }


  saveBook(formValue: any) {
    this.spinner.show();
    console.log('data saved', formValue.value);
    const formData = new FormData();
    formData.append('title', formValue.value.title);
    formData.append('author', formValue.value.author);
    formData.append('publication_year', formValue.value.publication_year);
    formData.append('genre', formValue.value.genre);
    formData.append('total_copies', formValue.value.total_copies);
    if (formValue.image instanceof File) {
      formData.append('image', formValue.image);
    }
    console.log(formData);

    if (this.book_id) {
      this.apiService.updateBook(this.book_id, formData).subscribe(
        (res) => {
          this.toastr.success(res.msg);
          this.getAllData();
          this.book_id = '';
          this.spinner.hide();
        },
        (error) => {
          const errorMessage =
            error.error && error.error.msg
              ? error.error.msg
              : 'An error occurred';
          this.toastr.error(errorMessage);
          this.spinner.hide();
        }
      );
    } else {
      this.spinner.show();
      this.apiService.addBooks(formData).subscribe(
        (res) => {
          this.toastr.success(res.msg);
          this.getAllData();
          this.spinner.hide();
        },
        (error) => {
          const errorMessage =
            error.error && error.error.msg
              ? error.error.msg
              : 'An error occurred';
          this.toastr.error(errorMessage);
          this.spinner.hide();
        }
      );
    }
  }


}
