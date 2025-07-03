import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  IonButton,
  IonInput,
  IonItem,
  IonContent,
  IonCard,
  IonCardContent,
  IonCardTitle,
  ToastController,
  IonIcon,
  IonText,
  LoadingController
} from '@ionic/angular/standalone';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { UserService, UserData } from 'src/app/services/user.service';
import { addIcons } from 'ionicons';
import { eye, eyeOff, lockClosed, mail, person } from 'ionicons/icons';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    IonButton,
    IonInput,
    IonItem,
    IonContent,
    IonCard,
    IonCardContent,
    IonCardTitle,
    IonIcon,
    IonText
  ]
})
export class SignupPage implements OnInit {
  signupForm!: FormGroup;
  passwordVisible = false;

  private fb = inject(FormBuilder);
  private toastController = inject(ToastController);
  private loadingController = inject(LoadingController);
  private router = inject(Router);
  private authService = inject(AuthService);
  private userService = inject(UserService);

  constructor() {
    addIcons({ mail, lockClosed, person, eye, eyeOff });
  }

  ngOnInit(): void {
    this.signupForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      confirmEmail: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    });
  }

  get nameControl() { return this.signupForm.get('name'); }
  get emailControl() { return this.signupForm.get('email'); }
  get confirmEmailControl() { return this.signupForm.get('confirmEmail'); }
  get passwordControl() { return this.signupForm.get('password'); }
  get confirmPasswordControl() { return this.signupForm.get('confirmPassword'); }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  async registerUser() {
    if (this.signupForm.invalid) {
      return this.showToast('Preencha todos os campos corretamente.', 'danger');
    }

    const { name, email, confirmEmail, password, confirmPassword } = this.signupForm.value;

    if (email !== confirmEmail) {
      return this.showToast('Os e-mails não coincidem.', 'danger');
    }
    if (password !== confirmPassword) {
      return this.showToast('As senhas não coincidem.', 'danger');
    }

    const loading = await this.loadingController.create({
      message: 'Criando conta...',
      spinner: 'circles'
    });
    await loading.present();

    try {
      const user = await this.authService.createUser(email, password);

      const userData: UserData = {
        uid: user.uid,
        name,
        email,
        createdAt: new Date()
      };
      await this.userService.saveUser(userData);

      await this.authService.signOut();

      await this.showToast('Conta criada com sucesso! Faça login para continuar.', 'success');
      this.router.navigateByUrl('/login');

    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      await this.showToast('Erro ao criar conta: ' + (error.message || ''), 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  private async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 1500,
      color,
      position: 'top'
    });
    await toast.present();
  }
}
