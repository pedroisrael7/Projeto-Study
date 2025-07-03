import { Injectable, inject } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
  signOut as firebaseSignOut,
  User
} from '@angular/fire/auth';
import {
  Firestore,
  doc,
  updateDoc
} from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  createUser(email: string, password: string): Promise<User> {
    return createUserWithEmailAndPassword(this.auth, email, password)
      .then((cred) => cred.user);
  }

  loginUser(email: string, password: string): Promise<User> {
    return signInWithEmailAndPassword(this.auth, email, password)
      .then((cred) => cred.user);
  }

  signOut(): Promise<void> {
    return firebaseSignOut(this.auth);
  }

  resetPassword(email: string): Promise<void> {
    return sendPasswordResetEmail(this.auth, email);
  }

  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  async reauthenticateUser(password: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user || !user.email) {
      throw new Error('Usuário não autenticado.');
    }

    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);
  }

  async updateUserEmail(newEmail: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado.');

    await user.reload();

    if (!user.emailVerified) {
      throw new Error('EMAIL_NOT_VERIFIED');
    }

    if (user.email === newEmail) {
      throw new Error('EMAIL_ALREADY_CURRENT');
    }

    await updateEmail(user, newEmail);

    const userRef = doc(this.firestore, `users/${user.uid}`);
    await updateDoc(userRef, { email: newEmail });
  }

  async updateUserName(uid: string, newName: string): Promise<void> {
    const userRef = doc(this.firestore, `users/${uid}`);
    await updateDoc(userRef, { name: newName });
  }

  async resendVerificationEmail(): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('Usuário não autenticado.');
    }

    await sendEmailVerification(user);
  }
}
