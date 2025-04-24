// Types for the Student API
export interface Program {
  id: number;
  name?: string;
}

export interface Student {
  id?: number;
  studentId: string;
  name: string;
  email: string;
  phone?: string;
  program: Program;
  semester: number;
  status: string;
  enrollmentDate?: string;
  address?: string;
}

// Student statistics interfaces
export interface TotalStudentsStats {
  totalStudents: number;
}

export interface StudentsByProgramStats {
  studentsByProgram: Record<string, number>;
  totalPrograms: number;
}

export interface StudentsBySemesterStats {
  studentsBySemester: Record<string, number>;
}

// Student API service
import { apiRequest } from "./api";

export const StudentService = {
  // Get all students
  getAllStudents: () => {
    return apiRequest<Student[]>("/students");
  },

  // Get student by ID
  getStudentById: (id: number) => {
    return apiRequest<Student>(`/students/${id}`);
  },

  // Create a new student
  createStudent: (student: Student) => {
    return apiRequest<Student>("/students", "POST", student);
  },

  // Update an existing student
  updateStudent: (id: number, student: Student) => {
    return apiRequest<Student>(`/students/${id}`, "PUT", student);
  },

  // Delete a student
  deleteStudent: (id: number) => {
    return apiRequest<void>(`/students/${id}`, "DELETE");
  },

  // Get total students count
  getTotalStudentsCount: () => {
    return apiRequest<TotalStudentsStats>("/students/stats/total");
  },

  // Get students grouped by program
  getStudentsByProgram: () => {
    return apiRequest<StudentsByProgramStats>("/students/stats/by-program");
  },

  // Get students grouped by semester
  getStudentsBySemester: () => {
    return apiRequest<StudentsBySemesterStats>("/students/stats/by-semester");
  },
};
