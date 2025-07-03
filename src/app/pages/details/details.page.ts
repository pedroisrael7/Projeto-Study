import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Timestamp } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Observable, switchMap } from 'rxjs';
import { map } from 'rxjs/operators';
import { QuestionService } from 'src/app/services/question.service';
import { UserService } from 'src/app/services/user.service';
import { Question } from 'src/app/interfaces/question';
import { Answer } from 'src/app/interfaces/answer';
import { IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent, IonCard, IonCardHeader, IonCardContent, IonItem, IonLabel, IonInput, IonButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBackOutline, closeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton
  ],
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss']
})
export class DetailsPage implements OnInit {

  private readonly auth = inject(Auth);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toastCtrl = inject(ToastController);
  private readonly questionService = inject(QuestionService);
  private readonly userService = inject(UserService);

  question!: Question;
  responseText = '';
  answers$!: Observable<Answer[]>;

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap(params => {
          const id = params.get('id');
          return this.questionService.getQuestionById(id!);
        })
      )
      .subscribe(question => {
        if (question.createdAt instanceof Timestamp) {
          question.createdAt = question.createdAt.toDate();
        }
        this.question = question;
        this.loadAnswers();
      });
  }

  constructor() {
    addIcons({ closeOutline });
  }

  loadAnswers() {
    this.answers$ = this.questionService.getAnswers(this.question.id!).pipe(
      map(answers =>
        answers.map(answer => ({
          ...answer,
          createdAt:
            answer.createdAt instanceof Timestamp
              ? answer.createdAt.toDate()
              : answer.createdAt,
        }))
      )
    );
  }

  async sendResponse() {
    const trimmed = this.responseText.trim();
    if (!trimmed) return;

    const user = this.auth.currentUser;
    if (!user) return;

    const userData = await this.userService.getUserById(user.uid);
    const answer: Answer = {
      userId: user.uid,
      userName: userData?.name || 'Usuário',
      content: trimmed,
      createdAt: new Date(),
    };

    await this.questionService.addAnswer(this.question.id!, answer);
    this.responseText = '';
    this.loadAnswers();
    this.showToast('Resposta enviada com sucesso!', 'success');
  }

  goBackToHome() {
    this.router.navigate(['/tabs/home']);
  }

  private async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 1500,
      color,
      position: 'top',
    });
    toast.present();
  }
}
