import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { QuestionService } from 'src/app/services/question.service';
import { Question } from 'src/app/interfaces/question';
import { Observable, BehaviorSubject, combineLatest, of, switchMap, map } from 'rxjs';
import { Auth } from '@angular/fire/auth';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { addIcons } from 'ionicons';
import { chatbubbleEllipsesOutline, trashOutline } from 'ionicons/icons';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardContent, IonButton, IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  imports: [
    CommonModule,
    IonicModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardContent,
    IonButton,
    IonIcon
  ]
})
export class HomePage {
  readonly auth = inject(Auth);
  private router = inject(Router);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);
  private questionService = inject(QuestionService);
  private firestore = inject(Firestore);

  private refreshTrigger$ = new BehaviorSubject<void>(undefined);
  questions$: Observable<(Question & { answerCount: number })[]>;

  constructor() {
    addIcons({ trashOutline, chatbubbleEllipsesOutline });

    this.questions$ = this.refreshTrigger$.pipe(
      switchMap(() => this.questionService.getAllQuestions()),
      switchMap(questions => {
        if (!questions || questions.length === 0) {
          return of([]);
        }

        const questionsWithCounts$ = questions.map(question => {
          const answersRef = collection(this.firestore, `questions/${question.id}/answers`);
          return collectionData(answersRef).pipe(
            map(answers => ({
              ...question,
              answerCount: answers.length
            }))
          );
        });

        return combineLatest(questionsWithCounts$);
      })
    );
  }

  openDetails(question: Question) {
    this.router.navigate(['/details', question.id]);
  }

  async confirmDelete(question: Question) {
    const alert = await this.alertCtrl.create({
      header: 'Excluir dúvida',
      message: 'Tem certeza que deseja excluir esta dúvida?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Excluir',
          role: 'destructive',
          handler: async () => {
            await this.questionService.deleteQuestion(question.id!);
            this.showToast('Dúvida excluída com sucesso.', 'success');
            this.refreshTrigger$.next();
          }
        }
      ]
    });

    await alert.present();
  }

  private async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 1500,
      color,
      position: 'top'
    });
    toast.present();
  }
}
