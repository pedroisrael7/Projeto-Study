import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import {
  IonContent,
  IonIcon,
  IonItem,
  IonInput,
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonCardTitle,
  ToastController,
  IonText
} from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';
import { addIcons } from 'ionicons';
import { mail } from 'ionicons/icons';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    IonItem,
    IonIcon,
    IonInput,
    IonButton,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardContent,
    IonCardTitle,
    IonText
  ]
})
export class ResetPasswordPage implements OnInit {
  resetForm!: FormGroup;
  isLoading = false;

  private fb = inject(FormBuilder);
  private toastCtrl = inject(ToastController);
  private authService = inject(AuthService);

  constructor() {
    addIcons({ mail });
  }

  ngOnInit(): void {
    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get emailControl() {
    return this.resetForm.get('email');
  }

  async resetPassword() {
    if (this.resetForm.invalid) {
      this.showToast('Por favor, preencha corretamente o campo de e-mail.', 'danger');
      return;
    }

    const email = this.emailControl?.value;

    this.isLoading = true;

    try {
      await this.authService.resetPassword(email);
      this.showToast('E-mail de redefinição enviado com sucesso!', 'success');
      this.resetForm.reset();
    } catch (error: any) {
      this.showToast('Erro ao enviar e-mail: ' + error.message, 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color,
      position: 'bottom'
    });
    toast.present();
  }
}
