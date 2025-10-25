import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-registration-users',
  imports: [CommonModule],
  templateUrl: './registration-users.html',
  styleUrl: './registration-users.scss'
})
export class RegistrationUsersComponent {
  @Input() tournamentId!: string;
}