export interface Task {
  id?: string;
  description: string;
  category: string;
  categoryColor: string;
  completed: boolean;
  createdAt: Date;
  userId: string;
}
