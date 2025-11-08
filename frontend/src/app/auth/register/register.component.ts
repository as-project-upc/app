import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularMaterialModule } from '../../ang-material.module';
import {client, ready} from "@serenity-kit/opaque";
import { AuthService } from '../../api/auth/auth.service';
import { RegistrationStartRequest } from '../../api/auth/auth.model';
import { Router } from '@angular/router';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [AngularMaterialModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  registerForm!: FormGroup;
  submitted = false;
  registrationSuccess = false;
  registrationError: string | null = null;

  constructor(private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.registerForm = this.formBuilder.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  onSubmit() {
    this.submitted = true;
    this.registrationError = null;
    this.registrationSuccess = false;

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const username = this.registerForm.get('username')?.value || '';
    const email = this.registerForm.get('email')?.value || '';
    const password = this.registerForm.get('password')?.value || '';

    const {clientRegistrationState, registrationRequest} = client.startRegistration({password});


    const request = new RegistrationStartRequest(
      username,
      email,
      registrationRequest
    );

    this.authService.register(request).subscribe({
      next: (data) => {
        if(data){
          this.router.navigate(['login'])
        }
      },
      error: (err) => {
        console.error('Error:', err);
      },
    });
  }
}
