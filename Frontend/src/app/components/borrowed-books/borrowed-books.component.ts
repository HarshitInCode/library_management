import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-borrowed-books',
  templateUrl: './borrowed-books.component.html',
  styleUrls: ['./borrowed-books.component.css']
})
export class BorrowedBooksComponent implements OnInit {
  role: string | undefined;
  tableData: any[] = [];

  currentPage = 1;
  totalPages = 1;
  itemsPerPage = 10;
  totalItems = 0;

  numberItemsSelected = 0;
  currentItemsRange: string = '';

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
  ) { }

  ngOnInit() {
    this.getBorrowedBooks();
  }

  getBorrowedBooks() {
    this.spinner.show();
    const user = this.authService.getUser();
    this.role = user.role;

    if (this.role === 'admin') {
      this.apiService.getBorrowedBooksforAdmin(this.currentPage, this.itemsPerPage).subscribe(
        (data) => {
          this.tableData = data.borrowList;
          this.totalItems = data.totalCount;
          this.totalPages = data.totalPages;
          this.updateCurrentItemsRange();
          this.spinner.hide();
        },
        (error) => {
          console.error(error);
          this.spinner.hide();
        }
      );
    } else {
      if (user) {
        this.apiService.getBorrowedBooksforUser(user.userId, this.currentPage, this.itemsPerPage).subscribe(
          (data) => {
            this.tableData = data.borrowList;
            this.totalItems = data.totalCount;
            this.totalPages = data.totalPages;
            this.updateCurrentItemsRange();
            this.spinner.hide();
          },
          (error) => {
            console.error(error);
            this.spinner.hide();
          }
        );
      }
    }
  }

  return(bookId: string) {
    this.spinner.show();
    this.apiService.returnBook(bookId).subscribe(
      (res) => {
        this.toastr.success(res.msg);
        this.getBorrowedBooks();
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

  updateCurrentItemsRange() {
    const startItem = (this.currentPage - 1) * this.itemsPerPage + 1;
    const endItem = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
    this.currentItemsRange = `${startItem}-${endItem} / ${this.totalItems} items`;
  }

  saveBook(formData: any) {

  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.getBorrowedBooks();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.getBorrowedBooks();
    }
  }
}
