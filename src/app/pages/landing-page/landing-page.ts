import { AsyncPipe, CommonModule, NgIf } from '@angular/common';
import { Component, HostBinding, inject } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup, User, user } from '@angular/fire/auth';
import { Subscription } from 'rxjs';
import { RouterLink } from '@angular/router';
import { LoaderService } from '../../services/loader.service';
import { ConfirmationModalService } from '../../services';

@Component({
  selector: 'app-landing-page',
  imports: [AsyncPipe, CommonModule, RouterLink],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.scss',
})
export class LandingPage {
  @HostBinding('class') hostClass = 'd-flex flex-column justify-content-center align-items-center masthead';
  private confirmationModal = inject(ConfirmationModalService);
  private auth = inject(Auth);
  user$ = user(this.auth);
  userSubscription: Subscription | undefined;
  loader = inject(LoaderService);
  constructor() {
    const id = this.loader.show();
    this.userSubscription = this.user$.subscribe((user: User | null) => {
      this.loader.hide(id);
    });
  }

  login() {
    const provider = new GoogleAuthProvider();
    signInWithPopup(this.auth, provider).then((result) => {
      // This gives you a Google Access Token. You can use it to access the Google API.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
    });
  }

  async logout() {
    const confirmed = await this.confirmationModal.confirm(
          '<i class="bi bi-box-arrow-right"></i> Logout',
          `<h5 class="text-center m-0 p-0 mt-2">Are you sure you want to logout?</h5>`
        );
        if (!confirmed) return;
    this.auth.signOut();
  }
}
