import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, AlertController, ToastController } from '@ionic/angular';
import { TaskService } from 'src/app/services/task.service';
import { Task } from 'src/app/interfaces/task';
import { AddTaskModalComponent } from 'src/app/components/add-task-modal/add-task-modal.component';
import { trash, add, clipboardOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, IonCard, IonCardContent, IonCheckbox, IonButton, IonBadge } from '@ionic/angular/standalone';

type TaskGroup = {
  category: string;
  color: string;
  tasks: Task[];
};

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.page.html',
  styleUrls: ['./tasks.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonIcon,
    IonCard,
    IonCardContent,
    IonCheckbox,
    IonButton,
    IonBadge
  ],
})
export class TasksPage {
  private taskService = inject(TaskService);
  private modalCtrl = inject(ModalController);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);

  constructor(private router: Router) {
    addIcons({ trash, add, clipboardOutline });
  }

  goToAdd() {
    this.router.navigate(['/tabs/welcome']);
  }

  tasksGrouped$ = this.taskService.getTasks().pipe(
    map(tasks => this.groupTasksByCategory(tasks))
  );

  private groupTasksByCategory(tasks: Task[]): TaskGroup[] {
    const grouped = tasks.reduce((acc, task) => {
      if (!acc[task.category]) {
        acc[task.category] = {
          category: task.category,
          color: task.categoryColor,
          tasks: [],
        };
      }
      acc[task.category].tasks.push(task);
      return acc;
    }, {} as Record<string, TaskGroup>);
    return Object.values(grouped);
  }

  async openAddTaskModal() {
    const modal = await this.modalCtrl.create({
      component: AddTaskModalComponent,
    });
    await modal.present();
  }

  async toggleCompleted(task: Task) {
    await this.taskService.updateTask({ ...task, completed: !task.completed });
  }

  async deleteTask(taskId: string) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar',
      message: 'Você tem certeza que deseja apagar esta tarefa?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Apagar',
          handler: async () => {
            await this.taskService.deleteTask(taskId);
            this.showToast('Tarefa apagada com sucesso.', 'success');
          },
        },
      ],
    });

    await alert.present();
  }

  private async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 1500,
      color,
      position: 'top',
    });
    await toast.present();
  }
}
