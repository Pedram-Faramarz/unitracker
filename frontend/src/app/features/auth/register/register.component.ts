import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  form: FormGroup;
  loading = signal(false);

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private toast: ToastService,
    private router: Router
  ) {
    this.form = this.fb.group({
      full_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      university: [''],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password2: ['', Validators.required],
    }, { validators: this.passwordMatch });
  }

  passwordMatch(g: FormGroup) {
    return g.get('password')?.value === g.get('password2')?.value ? null : { mismatch: true };
  }

  submit() {
    if (this.form.invalid || this.loading()) return;
    this.loading.set(true);
    this.auth.register(this.form.value).subscribe({
      next: () => { this.toast.success('Account created! Please sign in.'); this.router.navigate(['/auth/login']); },
      error: (err) => {
        const msg = Object.values(err.error || {}).flat().join(' ') || 'Registration failed.';
        this.toast.error(String(msg));
        this.loading.set(false);
      },
    });
  }
}
