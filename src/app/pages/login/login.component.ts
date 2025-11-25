import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  email = signal('');
  password = signal('');
  loading = signal(false);
  errorMessage = signal('');

  constructor(private supabaseService: SupabaseService, private router: Router) {}

  async onSubmit() {
    this.loading.set(true);
    this.errorMessage.set('');

    try {
      const { data, error } = await this.supabaseService.signIn(this.email(), this.password());

      if (error) {
        this.errorMessage.set(error.message);
      } else {
        this.router.navigate(['/']);
      }
    } catch (error) {
      this.errorMessage.set('Error signing in. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }
}
