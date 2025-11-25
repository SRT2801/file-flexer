import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  email = signal('');
  password = signal('');
  confirmPassword = signal('');
  loading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  constructor(private supabaseService: SupabaseService, private router: Router) {}

  async onSubmit() {
    this.loading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    // Validations
    if (this.password() !== this.confirmPassword()) {
      this.errorMessage.set('Passwords do not match');
      this.loading.set(false);
      return;
    }

    if (this.password().length < 6) {
      this.errorMessage.set('Password must be at least 6 characters');
      this.loading.set(false);
      return;
    }

    try {
      const { data, error } = await this.supabaseService.signUp(this.email(), this.password());

      if (error) {
        this.errorMessage.set(error.message);
      } else {
        this.successMessage.set(
          'Account created successfully. Check your email to confirm your account.'
        );
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      }
    } catch (error) {
      this.errorMessage.set('Error creating account. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }
}
