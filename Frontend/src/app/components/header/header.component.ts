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
    this.isMenuOpen = !this.isMenuOpen;
    const menuElement = this.el.nativeElement.querySelector('.nav__menu');

    if (menuElement) {
      if (this.isMenuOpen) {
        this.renderer.setStyle(menuElement, 'top', '0');
      } else {
        this.renderer.setStyle(menuElement, 'top', '-100%');
      }
    } else {
      console.error('error: cannot toggle menu');
    }
  }



  logout() {
    localStorage.clear();
    this.toatr.success('Logged out successfully');
    this.router.navigate(['/']);
  }
}
