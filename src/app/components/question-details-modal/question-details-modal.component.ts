import { Component, Input, inject, OnInit } from '@angular/core';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Timestamp } from '@angular/fire/firestore';
import { Question } from 'src/app/interfaces/question';
import { QuestionService } from 'src/app/services/question.service';
import { UserService } from 'src/app/services/user.service';
import { Auth } from '@angular/fire/auth';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { Answer } from 'src/app/interfaces/answer';
import { addIcons } from 'ionicons';
import { arrowBackOutline, closeOutline } from 'ionicons/icons';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-question-details-modal',
  standalone: true,
  templateUrl: './question-details-modal.component.html',
  styleUrls: ['./question-details-modal.component.scss'],
  imports: [IonicModule, CommonModule, FormsModule],
})

export class QuestionDetailsModalComponent implements OnInit {

  private readonly modalCtrl = inject(ModalController);
  private readonly toastCtrl = inject(ToastController);
  private readonly questionService = inject(QuestionService);
  private readonly userService = inject(UserService);
  private readonly auth = inject(Auth);

  responseText = '';
  answers$!: Observable<Answer[]>;

  private _question!: Question;
  @Input() set question(value: Question) {
    if (value && value.createdAt instanceof Timestamp) {
      value.createdAt = value.createdAt.toDate();
    }
    this._question = value;
  }
  get question(): Question {
    return this._question;
  }

  constructor() {
    addIcons({ arrowBackOutline, closeOutline });
  }

  ngOnInit(): void {
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

  close() {
    this.modalCtrl.dismiss();
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
    this.showToast('Resposta enviada com sucesso!', 'success');
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
