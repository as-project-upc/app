import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularMaterialModule } from '../../ang-material.module';
import { Router } from '@angular/router';
import { OpaqueService } from '../services/opaque.service';


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
  token: any;

  constructor(private formBuilder: FormBuilder,
    private router: Router,
    private opaqueService: OpaqueService
  ) {}

  ngOnInit(): void {
    this.registerForm = this.formBuilder.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
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
