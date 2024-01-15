import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';
import { NgxSpinnerService } from "ngx-spinner";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  userId: string = ''
  profileForm: FormGroup = this.fb.group({
    fName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    role: [''],
    phone: [''],
    street: [''],
    city: [''],
    state: [''],
    zipCode: [''],
    about: [''],
  });

  constructor(private fb: FormBuilder,
    private apiService: ApiService,
    private toast: ToastrService,
    private authService: AuthService,
    private spinner: NgxSpinnerService,) { }
  ngOnInit(): void {
    this.spinner.show();
    this.userId = this.authService.getUser().userId
    this.apiService.getSingleUserProfile(this.userId).subscribe(
      (response) => {
        const userData = response.user;
        this.profileForm.patchValue(userData);
        this.spinner.hide();
      },
      (error) => {
        console.error(error);
        this.spinner.hide();
      }
    );
  }

  onSubmit() {
    this.spinner.show();
    this.apiService.updateProfile(this.userId, this.profileForm.value).subscribe(response => {
      this.toast.success(response.msg);
      this.spinner.hide();
    }, error => {
      const errorMessage =
        error.error && error.error.msg
          ? error.error.msg
          : 'An error occurred';
      this.toast.error(errorMessage);
      this.spinner.hide();
    });
  }
}
