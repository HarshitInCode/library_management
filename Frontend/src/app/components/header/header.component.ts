import { Component, OnInit, Renderer2, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  isMenuOpen: boolean = false;
  role: any;

  constructor(
    private router: Router,
    private authService: AuthService,
    private toatr: ToastrService,
    private renderer: Renderer2,
    private el: ElementRef
  ) { }

  ngOnInit(): void {
    const user = this.authService.getUser();
    this.role = user.role;
  }

  toggleMenu() {
    console.log('Toggle menu clicked');
    this.isMenuOpen = !this.isMenuOpen;

    // Get the native element of the menu
    const menuElement = this.el.nativeElement.querySelector('.nav__menu');

    // Toggle the 'open' class directly on the native element
    if (this.isMenuOpen) {
      this.renderer.addClass(menuElement, 'open');
    } else {
      this.renderer.removeClass(menuElement, 'open');
    }
  }

  logout() {
    localStorage.clear();
    this.toatr.success('Logged out successfully');
    this.router.navigate(['/']);
  }
}
