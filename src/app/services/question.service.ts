import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  collectionData,
  query,
  orderBy,
  doc,
  docData,
  deleteDoc,
  CollectionReference
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Question } from '../interfaces/question';
import { Answer } from '../interfaces/answer';

@Injectable({ providedIn: 'root' })
export class QuestionService {
  private firestore = inject(Firestore);
  private questionsRef = collection(this.firestore, 'questions') as CollectionReference<Question>;

  addQuestion(question: Question): Promise<void> {
    const dataWithTimestamp = {
      ...question,
      createdAt: new Date()
    };
    return addDoc(this.questionsRef, dataWithTimestamp).then(() => { });
  }

  getAllQuestions(): Observable<Question[]> {
    const q = query(this.questionsRef, orderBy('createdAt', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<Question[]>;
  }

  getQuestionById(id: string): Observable<Question> {
    const ref = doc(this.firestore, `questions/${id}`);
    return docData(ref, { idField: 'id' }) as Observable<Question>;
  }

  deleteQuestion(id: string): Promise<void> {
    const ref = doc(this.firestore, `questions/${id}`);
    return deleteDoc(ref);
  }

  addAnswer(questionId: string, answer: Answer): Promise<void> {
    const answersRef = collection(this.firestore, `questions/${questionId}/answers`) as CollectionReference<Answer>;
    return addDoc(answersRef, answer).then(() => { });
  }

  getAnswers(questionId: string): Observable<Answer[]> {
    const answersRef = collection(this.firestore, `questions/${questionId}/answers`);
    const q = query(answersRef, orderBy('createdAt', 'asc'));
    return collectionData(q, { idField: 'id' }) as Observable<Answer[]>;
  }
}
