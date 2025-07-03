import { Component, inject } from '@angular/core';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TaskService } from 'src/app/services/task.service';
import { Task } from 'src/app/interfaces/task';
import { Auth } from '@angular/fire/auth';

@Component({
  selector: 'app-add-task-modal',
  styleUrls: ['./add-task-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule],
  templateUrl: './add-task-modal.component.html',
})

export class AddTaskModalComponent {

  private fb = inject(FormBuilder);
  private modalCtrl = inject(ModalController);
  private taskService = inject(TaskService);
  private auth = inject(Auth);
  private toastCtrl = inject(ToastController);

  form = this.fb.group({
    description: ['', Validators.required],
    category: ['Estudo', Validators.required],
  });

  private categoryColors: Record<string, string> = {
    Estudo: '#3880ff',
    Faculdade: '#2dd36f',
    Trabalho: '#eb445a',
  };

  private getColorForCategory(category: string): string {
    return this.categoryColors[category] || '#000000';
  }

  close() {
    this.modalCtrl.dismiss();
  }

  async submit() {
    if (this.form.invalid) {
      this.showToast('Preencha todos os campos obrigatórios.', 'danger');
      return;
    }

    const user = this.auth.currentUser;
    if (!user) {
      this.showToast('Usuário não autenticado.', 'danger');
      return;
    }

    const { description, category } = this.form.value;
    const categoryColor = this.getColorForCategory(category!);

    const task: Task = {
      description: description!,
      category: category!,
      categoryColor,
      completed: false,
      createdAt: new Date(),
      userId: user.uid,
    };

    try {
      await this.taskService.addTask(task);
      this.showToast('Tarefa adicionada com sucesso!', 'success');
      this.close();
    } catch (error: any) {
      this.showToast('Erro ao adicionar tarefa: ' + error.message, 'danger');
    }
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
