import {
  Firestore,
  collection,
  collectionData,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  CollectionReference,
  DocumentReference,
  query,
  where
} from '@angular/fire/firestore';
import { inject, Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { Auth, authState } from '@angular/fire/auth';
import { Task } from '../interfaces/task';

@Injectable({ providedIn: 'root' })

export class TaskService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  private tasksRef: CollectionReference<Task> = collection(this.firestore, 'tasks') as CollectionReference<Task>;

  getTasks(): Observable<Task[]> {
    return authState(this.auth).pipe(
      switchMap(user => {
        if (!user) return of([]);
        const q = query(this.tasksRef, where('userId', '==', user.uid));
        return collectionData(q, { idField: 'id' }) as Observable<Task[]>;
      })
    );
  }

  addTask(task: Task): Promise<void> {
    const docRef = doc(this.tasksRef) as DocumentReference<Task>;
    return setDoc(docRef, task);
  }

  updateTask(task: Task): Promise<void> {
    const { id, ...data } = task;
    const docRef = doc(this.firestore, `tasks/${id}`) as DocumentReference<Task>;
    return updateDoc(docRef, data as Partial<Task>);
  }

  deleteTask(taskId: string): Promise<void> {
    const docRef = doc(this.firestore, `tasks/${taskId}`);
    return deleteDoc(docRef);
  }
}
