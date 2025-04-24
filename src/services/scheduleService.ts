// Types for the Schedule API
export interface Schedule {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
}

export interface ScheduleGenerateRequest {
  programIds: string[];
  includeWeekends: boolean;
}

// New interfaces for exam slots
export interface ExamSlot {
  id?: number;
  examDate: string;
  startTime: string;
  endTime: string;
  subject?: {
    id: number;
    name: string;
    code: string;
  };
  room?: {
    id: number;
    roomNumber: string;
    capacity: number;
  };
  faculty?: {
    id: number;
    name: string;
    department: string;
  };
  examHead?: {
    id: number;
    name: string;
    department: string;
  };
  invigilators?: Array<{
    id: number;
    name: string;
    department: string;
  }>;
  studentCount: number;
}

export interface FacultyAvailability {
  id?: number;
  faculty?: {
    id: number;
    name: string;
    department: string;
  };
  date: string;
  startTime: string;
  endTime: string;
}

export interface ResourceAllocationRequest {
  assignFaculty: boolean;
  assignRoom: boolean;
  assignInvigilators: boolean;
}

export interface AllocationResponse {
  totalSlots: number;
  successfulAllocations: number;
  failedAllocations: number;
  message: string;
  slots: Array<{
    id: number;
    examDate: string;
    startTime: string;
    endTime: string;
    subject: string;
    room: string;
    faculty: string;
    examHead: string;
    invigilators: string[];
  }>;
}

// Schedule API service
import { apiRequest } from "./api";

export const ScheduleService = {
  // Get all schedules
  getAllSchedules: () => {
    return apiRequest<Schedule[]>("/schedule");
  },

  // Get schedule by ID
  getScheduleById: (id: number) => {
    return apiRequest<Schedule>(`/schedule/${id}`);
  },

  // Generate a new schedule
  generateSchedule: (
    startDate: string,
    endDate: string,
    scheduleName: string,
    data: ScheduleGenerateRequest
  ) => {
    // Create URL with encoded parameters
    const encodedName = encodeURIComponent(scheduleName);
    const queryParams = `startDate=${startDate}&endDate=${endDate}&scheduleName=${encodedName}`;

    // Use the properly formatted URL for the API call
    return apiRequest<Schedule>(
      `/schedule/generate?${queryParams}`,
      "POST",
      data
    );
  },

  // Export schedule as Excel
  exportSchedule: (id: number) => {
    return apiRequest<void>(`/schedule/${id}/export`);
  },

  // Email schedule
  emailSchedule: (id: number) => {
    return apiRequest<void>(`/schedule/${id}/email`, "POST");
  },

  // 1. Create and Configure Schedule
  // Get all exam slots in a schedule
  getExamSlots: (scheduleId: number) => {
    return apiRequest<ExamSlot[]>(`/schedule/${scheduleId}/slots`);
  },

  // Add a new exam slot to a schedule
  addExamSlot: (
    scheduleId: number,
    slot: {
      examDate: string;
      startTime: string;
      endTime: string;
      subjectId: number;
      studentCount: number;
    }
  ) => {
    return apiRequest<ExamSlot>(`/schedule/${scheduleId}/slots`, "POST", slot);
  },

  // 2. Configure Faculty Availability
  // Add availability slot for faculty
  addFacultyAvailability: (
    facultyId: number,
    availability: {
      date: string;
      startTime: string;
      endTime: string;
    }
  ) => {
    return apiRequest<FacultyAvailability>(
      `/schedule/faculty/${facultyId}/availability`,
      "POST",
      availability
    );
  },

  // Get available faculty for time slot
  getAvailableFaculty: (date: string, startTime: string, endTime: string) => {
    return apiRequest<
      Array<{
        id: number;
        name: string;
        department: string;
        currentWorkload: number;
        workloadCapacity: number;
        isExamHead: boolean;
        isInvigilator: boolean;
      }>
    >(
      `/schedule/faculty/available?date=${date}&startTime=${startTime}&endTime=${endTime}`
    );
  },

  // 3. Manual Faculty Assignment
  // Assign faculty to slot
  assignFacultyToSlot: (slotId: number, facultyId: number) => {
    return apiRequest<ExamSlot>(`/schedule/slots/${slotId}/faculty`, "PUT", {
      facultyId,
    });
  },

  // Assign exam head to slot
  assignExamHeadToSlot: (slotId: number, facultyId: number) => {
    return apiRequest<ExamSlot>(`/schedule/slots/${slotId}/examHead`, "PUT", {
      facultyId,
    });
  },

  // Add invigilator to slot
  addInvigilatorToSlot: (slotId: number, facultyId: number) => {
    return apiRequest<ExamSlot>(
      `/schedule/slots/${slotId}/invigilators`,
      "POST",
      { facultyId }
    );
  },

  // 4. Automatic Resource Allocation
  // Auto-allocate resources for single slot
  autoAllocateSlot: (slotId: number, request: ResourceAllocationRequest) => {
    return apiRequest<ExamSlot>(
      `/schedule/slots/${slotId}/allocate`,
      "PUT",
      request
    );
  },

  // Auto-allocate all slots in schedule
  autoAllocateAllSlots: (
    scheduleId: number,
    request: ResourceAllocationRequest
  ) => {
    return apiRequest<AllocationResponse>(
      `/schedule/${scheduleId}/allocate-all`,
      "POST",
      request
    );
  },

  // 5. Management and Adjustments
  // Remove invigilator from slot
  removeInvigilator: (slotId: number, facultyId: number) => {
    return apiRequest<ExamSlot>(
      `/schedule/slots/${slotId}/invigilators/${facultyId}`,
      "DELETE"
    );
  },
};
