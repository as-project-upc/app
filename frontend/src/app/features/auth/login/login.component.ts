import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, switchMap, takeUntil, EMPTY  } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export class LoginComponent implements OnInit {

  private unsubscribedEvent: Subject<any> = new Subject();
  passwordControl!: FormControl;

  loginForm!: FormGroup;
  submitted = false;
  loginDisplay = false;
  isAuthFailed = false;
  errorMessage: string = "";
  showPassword: boolean = false;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,

  ) {}

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
    this.passwordControl = this.loginForm.get('password') as FormControl;
  }

  onLogin() {
    this.submitted = true;
    this.isAuthFailed = false;

    if (this.loginForm.invalid) {
      const email = this.loginForm.get('email') as FormControl;
      const password = this.loginForm.get('password') as FormControl;
      email.markAsTouched();
      password.markAsTouched();
      this.submitted = false;
      return;
    }
  }

}
