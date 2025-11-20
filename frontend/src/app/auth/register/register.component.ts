import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AngularMaterialModule } from '../../ang-material.module';
import { Router } from '@angular/router';
import { OpaqueService } from '../../services/opaque.service';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [AngularMaterialModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  registerForm!: FormGroup;
  submitted = false;
  registrationSuccess = false;
  registrationError: string | null = null;
  token: any;
  passwordStrength: string = '';

  constructor(private formBuilder: FormBuilder,
    private router: Router,
    private opaqueService: OpaqueService
  ) {}

  ngOnInit(): void {
    this.registerForm = this.formBuilder.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/
          )
        ]
      ]
    });
    this.registerForm.get('password')?.valueChanges.subscribe(value => {
      this.passwordStrength = this.getPasswordStrength(value);
    });
  }

  getPasswordStrength(password: string): string {
    if (!password) return '';

    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[@$!%*?&]/.test(password);

    const strength = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;

    if (password.length < 8) return 'weak';
    if (strength >= 3) return 'strong';
    if (strength === 2) return 'medium';
    return 'weak';
  }

  async onSubmit() {
    this.submitted = true;
    this.registrationError = null;
    this.registrationSuccess = false;

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const username = this.registerForm.get('username')?.value;
    const email = this.registerForm.get('email')?.value;
    const password = this.registerForm.get('password')?.value;
    try {
      const regRes =  this.opaqueService.register(
        username,
        email,
        password,
        'admin'
      );
      console.log('Registered:', regRes);
      this.router.navigate(['login'])
    } catch (err) {
      console.error(err);
    }
  }
  username(username: any, password: any) {
    throw new Error('Method not implemented.');
  }
  password(username: any, password: any) {
    throw new Error('Method not implemented.');
  }
}
