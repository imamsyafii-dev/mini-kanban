export type Project = {
  id: number;
  name: string;
  description: string | null;
  color: string;
  created_at: string;
  updated_at: string;
};

export type CreateProjectPayload = {
  name: string;
  description?: string;
  color: string;
};

export type ProjectCollectionResponse = {
  data: Project[];
};

export type ProjectResponse = {
  data: Project;
};