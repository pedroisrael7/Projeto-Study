import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import {
  IonContent,
  IonItem,
  IonInput,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonCardTitle,
  ToastController,
  IonText,
  AlertController,
  LoadingController
} from '@ionic/angular/standalone';
import { RouterModule, Router } from '@angular/router';
import { Auth, signInWithEmailAndPassword, sendPasswordResetEmail } from '@angular/fire/auth';
import { addIcons } from 'ionicons';
import { eye, eyeOff, lockClosed, mail } from 'ionicons/icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonCardTitle,
    IonCardContent,
    IonCard,
    IonButton,
    IonInput,
    IonItem,
    IonContent,
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    IonIcon,
    IonText
  ]
})

export class LoginPage implements OnInit {

  loginForm!: FormGroup;
  passwordVisible = false;

  private toastController = inject(ToastController);
  private router = inject(Router);
  private auth = inject(Auth);
  private alertController = inject(AlertController);
  private loadingController = inject(LoadingController);

  constructor(private fb: FormBuilder) {
    addIcons({ mail, lockClosed, eye, eyeOff });
  }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  get emailControl() {
    return this.loginForm.get('email');
  }

  get passwordControl() {
    return this.loginForm.get('password');
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  async loginUser() {
    if (this.loginForm.invalid) {
      await this.showToast('Preencha todos os campos corretamente.', 'danger');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Entrando...',
      spinner: 'circles'
    });
    await loading.present();

    const { email, password } = this.loginForm.value;

    try {
      await signInWithEmailAndPassword(this.auth, email, password);
      await this.showToast('Login realizado com sucesso!', 'success');
      this.router.navigateByUrl('/tabs/home');
    } catch (error: any) {
      const errorMessage = error.message || 'Erro ao fazer login';
      await this.showToast(`Erro: ${errorMessage}`, 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  async promptPasswordReset() {
    const alert = await this.alertController.create({
      header: 'Redefinir Senha',
      message: 'Informe o e-mail cadastrado para receber um link de redefinição.',
      inputs: [
        {
          name: 'email',
          type: 'email',
          placeholder: 'Digite seu e-mail',
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Enviar',
          handler: async (data) => {
            const email = (data.email || '').trim();

            if (!Validators.email || !email || !this.isValidEmail(email)) {
              await this.showToast('E-mail inválido!', 'danger');
              return false;
            }

            const loading = await this.loadingController.create({
              message: 'Enviando...',
              spinner: 'circles'
            });
            await loading.present();

            try {
              await sendPasswordResetEmail(this.auth, email);
              await this.showToast('E-mail enviado com sucesso!', 'success');
              return true;
            } catch (error: any) {
              await this.showToast(`Erro: ${error.message}`, 'danger');
              return false;
            } finally {
              await loading.dismiss();
            }
          }
        }
      ]
    });

    await alert.present();
  }

  isValidEmail(email: string): boolean {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
  }

  async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 1500,
      color,
      position: 'top'
    });
    toast.present();
  }
}
