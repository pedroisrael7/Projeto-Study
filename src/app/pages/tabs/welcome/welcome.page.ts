import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonInput, IonSelect, IonSelectOption, IonText } from '@ionic/angular/standalone';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TaskService } from 'src/app/services/task.service';
import { Task } from 'src/app/interfaces/task';
import { Auth } from '@angular/fire/auth';
import { addIcons } from 'ionicons';
import { arrowBackOutline } from 'ionicons/icons';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonText
  ],
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
})

export class WelcomePage implements OnInit {

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private toastCtrl = inject(ToastController);
  private taskService = inject(TaskService);
  private auth = inject(Auth);

  form = this.fb.group({
    description: ['', Validators.required],
    category: ['Estudo', Validators.required],
  });

  private categoryColors: Record<string, string> = {
    Estudo: '#3880ff',
    Faculdade: '#2dd36f',
    Trabalho: '#eb445a',
  };

  constructor() {
    addIcons({ arrowBackOutline });
  }

  ngOnInit(): void {
  }

  cancel(): void {
    this.router.navigate(['/tabs/tasks']);
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.showToast('Preencha todos os campos obrigatórios.', 'danger');
      return;
    }

    const user = this.auth.currentUser;
    if (!user) {
      this.showToast('Usuário não autenticado.', 'danger');
      this.router.navigate(['/tabs/taskstasks']);
      return;
    }

    const { description, category } = this.form.value as {
      description: string;
      category: string;
    };
    const task: Task = {
      description,
      category,
      categoryColor: this.categoryColors[category] || '#000',
      completed: false,
      createdAt: new Date(),
      userId: user.uid,
    };

    try {
      await this.taskService.addTask(task);
      this.showToast('Tarefa adicionada com sucesso!', 'success');
      this.router.navigateByUrl('/tabs/tasks');
      return;
    } catch (error: any) {
      this.showToast('Erro ao adicionar tarefa: ' + error.message, 'danger');
      return;
    }
  }

  private async showToast(message: string, color: string = 'primary'): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 1500,
      color,
      position: 'top',
    });
    await toast.present();
  }
}
