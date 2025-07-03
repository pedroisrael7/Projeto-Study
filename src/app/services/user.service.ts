import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  doc,
  setDoc,
  collection,
  getDoc,
  serverTimestamp,
  Timestamp
} from '@angular/fire/firestore';

export interface UserData {
  uid: string;
  name: string;
  email: string;
  createdAt: Date;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private firestore = inject(Firestore);

  async saveUser(user: UserData): Promise<void> {
    const userRef = doc(collection(this.firestore, 'users'), user.uid);
    await setDoc(userRef, {
      uid: user.uid,
      name: user.name,
      email: user.email,
      createdAt: serverTimestamp()
    });
  }

  async getUserById(uid: string): Promise<UserData | null> {
    const userRef = doc(this.firestore, 'users', uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      return null;
    }

    const data = snap.data();
    const createdAtTs = data['createdAt'] as Timestamp;
    return {
      uid: data['uid'] as string,
      name: data['name'] as string,
      email: data['email'] as string,
      createdAt: createdAtTs.toDate()
    };
  }
}
