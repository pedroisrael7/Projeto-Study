import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { homeOutline, logInOutline, listOutline, settingsOutline, bookOutline, albums, clipboard, settingsSharp, listSharp, sendSharp, albumsSharp, addCircleSharp } from 'ionicons/icons';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  standalone: true,
  imports: [
    IonIcon,
    IonTabButton,
    IonTabBar,
    IonTabs,
    CommonModule,
    FormsModule,
    RouterModule,
  ]
})
export class TabsPage implements OnInit {

  constructor() {
    addIcons({ albumsSharp, sendSharp, listSharp, addCircleSharp, settingsSharp, albums, bookOutline, settingsOutline, clipboard, listOutline, homeOutline, logInOutline });
  }

  ngOnInit() {
  }

}
