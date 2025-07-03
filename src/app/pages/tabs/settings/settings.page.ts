import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Auth, signOut } from '@angular/fire/auth';
import { addIcons } from 'ionicons';
import { logOutOutline } from 'ionicons/icons';
import { Firestore, doc, docData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel, IonButton, IonIcon, IonImg, IonThumbnail } from '@ionic/angular/standalone';

@Component({
  selector: 'app-settings',
  standalone: true,
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  imports: [
    CommonModule,
    IonicModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonButton,
    IonIcon,
    IonImg,
  ],
})
export class SettingsPage implements OnInit {
  private auth = inject(Auth);
  private router = inject(Router);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);
  private firestore = inject(Firestore);

  userData$!: Observable<{ name: string; email: string }>;

  constructor() {
    addIcons({ logOutOutline });
  }

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData() {
    const user = this.auth.currentUser;
    if (user) {
      const userRef = doc(this.firestore, `users/${user.uid}`);
      this.userData$ = docData(userRef) as Observable<{ name: string; email: string }>;
    }
  }

  async confirmLogout() {
    const alert = await this.alertCtrl.create({
      header: 'Sair da conta',
      message: 'Deseja realmente sair da sua conta?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Sair',
          handler: async () => {
            await signOut(this.auth);
            await this.router.navigate(['/login'], { replaceUrl: true });
          }
        }
      ]
    });

    await alert.present();
  }


  async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 1500,
      color,
      position: 'top',
    });
    toast.present();
  }
}
