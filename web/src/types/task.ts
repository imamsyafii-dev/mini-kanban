export type TaskStatus = "todo" | "in_progress" | "done";

export type Task = {
  id: number;
  project_id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  position: number;
  due_date: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateTaskPayload = {
  title: string;
  description?: string;
  status?: TaskStatus;
  due_date?: string | null;
};

export type UpdateTaskPayload = Omit<Partial<CreateTaskPayload>, "description"> & {
  description?: string | null;
  position?: number;
};

export type TaskCollectionResponse = {
  data: Task[];
};

export type TaskResponse = {
  data: Task;
};
