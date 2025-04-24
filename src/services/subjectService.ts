// Types for the Subject API
export interface Subject {
  id?: number;
  name: string;
  code: string;
  program?: {
    id: number;
    name: string;
  };
  enrolledStudents?: number;
}

// Subject API service
import { apiRequest } from "./api";

export const SubjectService = {
  // Get all subjects
  getAllSubjects: () => {
    return apiRequest<Subject[]>("/subjects");
  },

  // Get subject by ID
  getSubjectById: (id: number) => {
    return apiRequest<Subject>(`/subjects/${id}`);
  },

  // Get subjects by program ID
  getSubjectsByProgram: (programId: number) => {
    return apiRequest<Subject[]>(`/subjects/program/${programId}`);
  },
};
