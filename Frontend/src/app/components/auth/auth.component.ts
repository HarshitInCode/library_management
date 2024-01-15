import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent {
  isSignUpMode = false;
  signInForm: FormGroup;
  signUpForm: FormGroup;
  showPassword = false;
  showPasswordSignup = false;

  constructor(private fb: FormBuilder, private authService: AuthService,
    private toastr: ToastrService,
    private router: Router,
  ) {
    this.signInForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.signUpForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      fName: ['', Validators.required],
      userRole: ['user', Validators.required]
    });
  }

  toggleMode() {
    this.isSignUpMode = !this.isSignUpMode;
  }

  signIn() {
    if (this.signInForm.valid) {
      const { email, password } = this.signInForm.value;
      this.authService.login(email, password).subscribe(
        response => {
          this.toastr.success('Login successful');
          this.router.navigate(['/books']);
        },
        error => {
          const errorMessage = error.error && error.error.msg ? error.error.msg : 'An error occurred';
          this.toastr.error(errorMessage);
        }
      );
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
  togglePasswordVisibilityUp() {
    this.showPasswordSignup = !this.showPasswordSignup;
  }

  signUp() {
    if (this.signUpForm.valid) {
      const { fName, email, password, userRole } = this.signUpForm.value;
      this.authService.signup(fName, email, password, userRole).subscribe(
        response => {
          this.toastr.success('Register successful', 'Please login');
          this.toggleMode();
        },
        error => {
          const errorMessage = error.error && error.error.msg ? error.error.msg : 'An error occurred';
          this.toastr.error(errorMessage);
        }
      );
    }
  }
}
