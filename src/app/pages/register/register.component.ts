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

    // Validaciones
    if (this.password() !== this.confirmPassword()) {
      this.errorMessage.set('Las contraseñas no coinciden');
      this.loading.set(false);
      return;
    }

    if (this.password().length < 6) {
      this.errorMessage.set('La contraseña debe tener al menos 6 caracteres');
      this.loading.set(false);
      return;
    }

    try {
      const { data, error } = await this.supabaseService.signUp(this.email(), this.password());

      if (error) {
        this.errorMessage.set(error.message);
      } else {
        this.successMessage.set(
          'Cuenta creada exitosamente. Revisa tu email para confirmar tu cuenta.'
        );
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      }
    } catch (error) {
      this.errorMessage.set('Error al crear la cuenta. Intenta nuevamente.');
    } finally {
      this.loading.set(false);
    }
  }
}
