import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthComponent } from './components/auth/auth.component';
import { HomeComponent } from './components/home/home.component';
import { ProfileComponent } from './components/profile/profile.component';
import { BorrowedBooksComponent } from './components/borrowed-books/borrowed-books.component';
import { UsersComponent } from './components/users/users.component';
import { AuthGuard } from './guards/auth.guard'; // Import your AuthGuard

const routes: Routes = [
  {
    path: '',
    component: AuthComponent
  },
  {
    path: 'books',
    component: HomeComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'borrowed-books',
    component: BorrowedBooksComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'all-users',
    component: UsersComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
