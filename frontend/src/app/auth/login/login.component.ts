import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { OpaqueService } from '../services/opaque.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export class LoginComponent implements OnInit, OnDestroy {
  private unsubscribedEvent = new Subject<void>();
  passwordControl!: FormControl;

  loginForm!: FormGroup;
  submitted = false;
  isAuthFailed = false;
  errorMessage = '';
  showPassword = false;
  loading = false;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private opaqueService: OpaqueService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
    this.passwordControl = this.loginForm.get('password') as FormControl;
  }

  async onLogin() {
    this.submitted = true;
    this.isAuthFailed = false;
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { username, password } = this.loginForm.value;
    this.loading = true;

    try {
      const loginRes = await this.opaqueService.login(username, password);
      console.log('Login successful:', loginRes);

      if (loginRes.token) {
        localStorage.setItem('authToken', loginRes.token);
        this.router.navigate(['dashboard'])
      } else {
        this.isAuthFailed = true;
        this.errorMessage = 'Invalid response from server.';
      }
    } catch (err: any) {
      console.error('Login error:', err);
      this.isAuthFailed = true;
      this.errorMessage = err.message || 'Invalid credentials';
    } finally {
      this.loading = false;
    }
  }

  ngOnDestroy(): void {
    this.unsubscribedEvent.next();
    this.unsubscribedEvent.complete();
  }
}
