import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from "ngx-spinner";

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  UserForm: FormGroup | undefined;
  user_id: string = '';
  role: string | undefined;

  numberItemsSelected = 0;
  tableData: any[] = [];

  itemsPerPage = 10;
  currentPage = 1;
  totalPages = 1;
  totalItems = 0;
  currentItemsRange: string = '';
  isFormTouched: boolean = false;

  constructor(
    private apiService: ApiService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
  ) { }

  ngOnInit() {
    this.isFormTouched = false;
    this.UserForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      fName: ['', Validators.required],
      password: ['', [Validators.minLength(6)]],
      role: ['user', Validators.required],
    });

    this.getAllUser(this.currentPage, this.itemsPerPage);
  }

  onFormControlTouched() {
    this.isFormTouched = true;
  }

  checkFormValidity(): boolean {
    return !!this.UserForm && this.UserForm.valid && this.isFormTouched;
  }


  deleteUser(userId: string) {
    this.spinner.show();
    this.apiService.deleteUser(userId).subscribe(
      (response) => {
        this.toastr.success(response.msg);
        this.getAllUser();
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

  getAllUser(page: number = 1, limit: number = 10) {
    this.spinner.show();
    this.apiService.getAllUsers(page, limit).subscribe(
      (data) => {
        this.tableData = data.profiles;
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

  updateCurrentItemsRange() {
    if (this.currentPage && this.totalPages) {
      const startItem = (this.currentPage - 1) * this.itemsPerPage + 1;
      const endItem = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
      this.currentItemsRange = `${startItem}-${endItem} / ${this.totalItems} items`;
    }
  }


  editUser(userId: string) {
    this.spinner.show();
    this.user_id = userId;
    this.apiService.getSingleUserProfile(userId).subscribe(
      (response) => {
        const userProfile = response.user;
        this.UserForm?.patchValue({
          fName: userProfile.fName,
          email: userProfile.email,
          password: '',
          role: userProfile.role,
        });
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

  saveUser() {
    this.spinner.show();
    if (this.UserForm && this.UserForm.valid) {
      this.apiService.updateProfile(this.user_id, this.UserForm.value).subscribe(
        (response) => {
          this.toastr.success(response.msg);
          this.getAllUser();
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

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.getAllUser(this.currentPage, this.itemsPerPage);
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.getAllUser(this.currentPage, this.itemsPerPage);
    }
  }
}
