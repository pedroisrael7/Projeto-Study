import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { QuestionService } from 'src/app/services/question.service';
import { Auth } from '@angular/fire/auth';
import { RouterModule, Router } from '@angular/router';
import { Firestore } from '@angular/fire/firestore';
import { UserService } from 'src/app/services/user.service';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonItem, IonLabel, IonInput, IonText, IonButton
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-asks',
  standalone: true,
  templateUrl: './asks.page.html',
  styleUrls: ['./asks.page.scss'],
  imports: [
    CommonModule, IonicModule, ReactiveFormsModule, RouterModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonItem, IonLabel, IonInput, IonText, IonButton
  ],
})
export class AsksPage {

  form: FormGroup;
  private fb = inject(FormBuilder);
  private toastCtrl = inject(ToastController);
  private questionService = inject(QuestionService);
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private userService = inject(UserService);
  private router = inject(Router);

  constructor() {
    this.form = this.fb.group({
      description: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  async submit() {
    if (this.form.invalid) return;

    const user = this.auth.currentUser;
    if (!user) return;

    const userData = await this.userService.getUserById(user.uid);

    const question = {
      userId: user.uid,
      userName: userData?.name || 'Usuário',
      description: this.form.value.description,
      createdAt: new Date()
    };

    await this.questionService.addQuestion(question);
    this.form.reset();
    await this.showToast('Dúvida publicada com sucesso!', 'success');
    this.router.navigateByUrl('/tabs/home');
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 1500,
      color,
      position: 'top',
    });
    await toast.present();
  }
}
