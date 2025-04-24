import React, { useState, useEffect, Suspense } from "react";
import {
  Calendar,
  Download,
  Mail,
  Plus,
  Clock,
  User,
  Users,
  Briefcase,
  School,
  MapPin,
} from "lucide-react";
import {
  Schedule,
  ScheduleService,
  ExamSlot,
  ResourceAllocationRequest,
} from "../services/scheduleService";
import { Faculty } from "../services/examService";

// Create a loading placeholder component
const LoadingPlaceholder = () => (
  <div className="flex flex-col items-center justify-center py-10">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4"></div>
    <p className="text-indigo-600">Loading schedules...</p>
  </div>
);

// Calendar component to display the exam schedule visually
const ScheduleCalendar = ({ schedules }: { schedules: Schedule[] }) => {
  // Generate calendar days for current month
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  // Calendar grid days
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Days of the week
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Find exams for a specific day
  const getExamsForDay = (day: number) => {
    const dateToCheck = new Date(currentYear, currentMonth, day)
      .toISOString()
      .split("T")[0];
    // This is dummy data - in a real app, you would filter actual exams
    const dummyExams = [
      { id: 1, date: "2025-04-10", subject: "Mathematics", time: "09:00 AM" },
      {
        id: 2,
        date: "2025-04-15",
        subject: "Computer Science",
        time: "02:00 PM",
      },
      { id: 3, date: "2025-04-17", subject: "Physics", time: "10:00 AM" },
      { id: 4, date: "2025-04-20", subject: "English", time: "01:00 PM" },
      { id: 5, date: "2025-04-22", subject: "Chemistry", time: "11:00 AM" },
    ];

    return dummyExams.filter((exam) => exam.date === dateToCheck);
  };

  return (
    <div className="mt-8 bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 bg-indigo-600 text-white">
        <h3 className="text-xl font-semibold">April 2025</h3>
        <p className="text-indigo-100">Exam Schedule Calendar</p>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {/* Calendar header - days of week */}
        {weekDays.map((day, index) => (
          <div key={index} className="p-2 bg-gray-100 text-center font-medium">
            {day}
          </div>
        ))}

        {/* Empty cells for days before the 1st of the month */}
        {Array.from({ length: firstDayOfMonth }, (_, i) => (
          <div key={`empty-${i}`} className="p-2 bg-white h-24"></div>
        ))}

        {/* Calendar days */}
        {days.map((day) => {
          const exams = getExamsForDay(day);
          const isToday = day === currentDate.getDate();

          return (
            <div
              key={day}
              className={`p-2 bg-white h-24 overflow-y-auto ${
                isToday ? "ring-2 ring-indigo-500" : ""
              }`}
            >
              <div
                className={`text-right font-medium mb-1 ${
                  isToday ? "text-indigo-600" : ""
                }`}
              >
                {day}
              </div>

              {/* Exam entries */}
              {exams.map((exam) => (
                <div
                  key={exam.id}
                  className="text-xs p-1 mb-1 rounded bg-indigo-100 text-indigo-800"
                >
                  <div className="font-medium">{exam.subject}</div>
                  <div>{exam.time}</div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Exam Slot Management component for displaying and managing exam slots
const ExamSlotManagement = ({ schedule }: { schedule: Schedule }) => {
  const [slots, setSlots] = useState<ExamSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [showFacultyModal, setShowFacultyModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<ExamSlot | null>(null);
  const [availableFaculty, setAvailableFaculty] = useState<Faculty[]>([]);
  const [autoAllocateLoading, setAutoAllocateLoading] = useState(false);

  // New slot form data
  const [newSlotData, setNewSlotData] = useState({
    examDate: "",
    startTime: "",
    endTime: "",
    subjectId: 0,
    studentCount: 0,
  });

  // Load exam slots when component mounts
  useEffect(() => {
    fetchExamSlots();
  }, [schedule]);

  // Fetch exam slots for the selected schedule
  const fetchExamSlots = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ScheduleService.getExamSlots(schedule.id);
      setSlots(data);
    } catch (err) {
      console.error("Failed to fetch exam slots:", err);
      setError("Failed to load exam slots. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes for new slot form
  const handleNewSlotChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    setNewSlotData({
      ...newSlotData,
      [name]: type === "number" ? parseInt(value, 10) : value,
    });
  };

  // Add a new exam slot
  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await ScheduleService.addExamSlot(schedule.id, newSlotData);

      // Refresh the slots list
      await fetchExamSlots();

      // Close the modal and reset form
      setShowAddSlot(false);
      setNewSlotData({
        examDate: "",
        startTime: "",
        endTime: "",
        subjectId: 0,
        studentCount: 0,
      });
    } catch (err) {
      console.error("Failed to add exam slot:", err);
      setError("Failed to add exam slot. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Get available faculty
  const handleViewFaculty = async (slot: ExamSlot) => {
    setLoading(true);
    setError(null);
    setSelectedSlot(slot);

    try {
      const data = await ScheduleService.getAvailableFaculty(
        slot.examDate,
        slot.startTime,
        slot.endTime
      );
      setAvailableFaculty(data);
      setShowFacultyModal(true);
    } catch (err) {
      console.error("Failed to fetch available faculty:", err);
      setError("Failed to load available faculty. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Assign faculty to slot
  const assignFaculty = async (facultyId: number) => {
    if (!selectedSlot) return;

    setLoading(true);
    setError(null);

    try {
      await ScheduleService.assignFacultyToSlot(selectedSlot.id!, facultyId);

      // Refresh the slots
      await fetchExamSlots();

      // Update the selected slot
      const updatedSlot = await ScheduleService.getExamSlots(schedule.id).then(
        (slots) => slots.find((s) => s.id === selectedSlot.id)
      );

      if (updatedSlot) {
        setSelectedSlot(updatedSlot);
      }
    } catch (err) {
      console.error("Failed to assign faculty:", err);
      setError("Failed to assign faculty. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Assign exam head
  const assignExamHead = async (facultyId: number) => {
    if (!selectedSlot) return;

    setLoading(true);
    setError(null);

    try {
      await ScheduleService.assignExamHeadToSlot(selectedSlot.id!, facultyId);

      // Refresh the slots
      await fetchExamSlots();

      // Update the selected slot
      const updatedSlot = await ScheduleService.getExamSlots(schedule.id).then(
        (slots) => slots.find((s) => s.id === selectedSlot.id)
      );

      if (updatedSlot) {
        setSelectedSlot(updatedSlot);
      }
    } catch (err) {
      console.error("Failed to assign exam head:", err);
      setError("Failed to assign exam head. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Add invigilator
  const addInvigilator = async (facultyId: number) => {
    if (!selectedSlot) return;

    setLoading(true);
    setError(null);

    try {
      await ScheduleService.addInvigilatorToSlot(selectedSlot.id!, facultyId);

      // Refresh the slots
      await fetchExamSlots();

      // Update the selected slot
      const updatedSlot = await ScheduleService.getExamSlots(schedule.id).then(
        (slots) => slots.find((s) => s.id === selectedSlot.id)
      );

      if (updatedSlot) {
        setSelectedSlot(updatedSlot);
      }
    } catch (err) {
      console.error("Failed to add invigilator:", err);
      setError("Failed to add invigilator. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Auto allocate resources
  const handleAutoAllocate = async () => {
    setAutoAllocateLoading(true);
    setError(null);

    try {
      const request: ResourceAllocationRequest = {
        assignFaculty: true,
        assignRoom: true,
        assignInvigilators: true,
      };

      await ScheduleService.autoAllocateAllSlots(schedule.id, request);

      // Refresh the slots
      await fetchExamSlots();

      alert("Resources allocated successfully!");
    } catch (err) {
      console.error("Failed to auto-allocate resources:", err);
      setError("Failed to auto-allocate resources. Please try again.");
    } finally {
      setAutoAllocateLoading(false);
    }
  };

  // Remove invigilator
  const removeInvigilator = async (slotId: number, facultyId: number) => {
    setLoading(true);
    setError(null);

    try {
      await ScheduleService.removeInvigilator(slotId, facultyId);

      // Refresh the slots
      await fetchExamSlots();

      // Update the selected slot if it's the one being modified
      if (selectedSlot && selectedSlot.id === slotId) {
        const updatedSlot = await ScheduleService.getExamSlots(
          schedule.id
        ).then((slots) => slots.find((s) => s.id === slotId));

        if (updatedSlot) {
          setSelectedSlot(updatedSlot);
        }
      }
    } catch (err) {
      console.error("Failed to remove invigilator:", err);
      setError("Failed to remove invigilator. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex justify-between items-center bg-gradient-to-r from-indigo-700 to-purple-600 text-white">
          <div>
            <h3 className="text-lg leading-6 font-medium">
              Exam Slots for {schedule.name}
            </h3>
            <p className="mt-1 text-sm opacity-90">
              {schedule.startDate} to {schedule.endDate}
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowAddSlot(true)}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-800 hover:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Slot
            </button>
            <button
              onClick={handleAutoAllocate}
              disabled={autoAllocateLoading}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-800 hover:bg-purple-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              {autoAllocateLoading ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Allocating...
                </>
              ) : (
                <>
                  <Users className="h-4 w-4 mr-1" />
                  Auto Allocate
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="px-4 py-3 bg-red-50 border-b border-red-200 text-red-800">
            {error}
          </div>
        )}

        {/* Slots List */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : slots.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No exam slots found for this schedule. Add a slot to get started.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Subject
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date & Time
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Room
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Faculty
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Students
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {slots.map((slot) => (
                  <tr key={slot.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
                          <School className="h-6 w-6" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {slot.subject?.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {slot.subject?.code}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {slot.examDate}
                      </div>
                      <div className="text-sm text-gray-500">
                        {slot.startTime} - {slot.endTime}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {slot.room ? (
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                          <div className="text-sm text-gray-900">
                            {slot.room.roomNumber}
                          </div>
                        </div>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Not Assigned
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {slot.faculty ? (
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-gray-400 mr-1" />
                            <span className="text-gray-900">
                              {slot.faculty.name}
                            </span>
                          </div>
                          {slot.examHead && (
                            <div className="flex items-center">
                              <Briefcase className="h-4 w-4 text-gray-400 mr-1" />
                              <span>Head: {slot.examHead.name}</span>
                            </div>
                          )}
                          {slot.invigilators &&
                            slot.invigilators.length > 0 && (
                              <div className="flex items-center">
                                <Users className="h-4 w-4 text-gray-400 mr-1" />
                                <span>Invig: {slot.invigilators.length}</span>
                              </div>
                            )}
                        </div>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Not Assigned
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {slot.studentCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewFaculty(slot)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        Manage Staff
                      </button>
                      <button
                        onClick={() => {
                          if (slot.id) {
                            const request: ResourceAllocationRequest = {
                              assignFaculty: true,
                              assignRoom: true,
                              assignInvigilators: true,
                            };
                            ScheduleService.autoAllocateSlot(slot.id, request)
                              .then(() => fetchExamSlots())
                              .catch((err) => {
                                console.error(
                                  "Failed to auto-allocate slot:",
                                  err
                                );
                                setError(
                                  "Failed to auto-allocate resources for this slot."
                                );
                              });
                          }
                        }}
                        className="text-green-600 hover:text-green-900"
                      >
                        Auto-Assign
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Exam Slot Modal */}
      {showAddSlot && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <div className="mb-5">
              <h3 className="text-lg font-medium text-gray-900">
                Add New Exam Slot
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Create a new exam slot for {schedule.name}
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleAddSlot}>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Exam Date
                </label>
                <input
                  type="date"
                  name="examDate"
                  value={newSlotData.examDate}
                  onChange={handleNewSlotChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Start Time
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    value={newSlotData.startTime}
                    onChange={handleNewSlotChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    End Time
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    value={newSlotData.endTime}
                    onChange={handleNewSlotChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Subject
                </label>
                <select
                  name="subjectId"
                  value={newSlotData.subjectId}
                  onChange={handleNewSlotChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                >
                  <option value="">Select a subject</option>
                  <option value="101">Computer Science (CS101)</option>
                  <option value="102">Mathematics (MATH201)</option>
                  <option value="103">Physics (PHY101)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Number of Students
                </label>
                <input
                  type="number"
                  name="studentCount"
                  value={newSlotData.studentCount}
                  onChange={handleNewSlotChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  min="1"
                  required
                />
              </div>

              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddSlot(false)}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Adding...
                    </>
                  ) : (
                    "Add Slot"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Faculty Assignment Modal */}
      {showFacultyModal && selectedSlot && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="mb-5 flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Manage Faculty Assignments
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedSlot.subject?.name} ({selectedSlot.examDate}:{" "}
                  {selectedSlot.startTime} - {selectedSlot.endTime})
                </p>
              </div>
              <button
                onClick={() => setShowFacultyModal(false)}
                className="rounded-md text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Current Assignments */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-base font-medium text-gray-900 mb-4">
                  Current Assignments
                </h4>

                <div className="space-y-4">
                  {/* Main Faculty */}
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h5 className="text-sm font-medium text-gray-700 flex items-center">
                      <User className="h-4 w-4 mr-2 text-indigo-600" />
                      Main Faculty
                    </h5>
                    {selectedSlot.faculty ? (
                      <div className="mt-2 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {selectedSlot.faculty.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {selectedSlot.faculty.department}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-gray-500">
                        No faculty assigned
                      </p>
                    )}
                  </div>

                  {/* Exam Head */}
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h5 className="text-sm font-medium text-gray-700 flex items-center">
                      <Briefcase className="h-4 w-4 mr-2 text-indigo-600" />
                      Exam Head
                    </h5>
                    {selectedSlot.examHead ? (
                      <div className="mt-2 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {selectedSlot.examHead.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {selectedSlot.examHead.department}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-gray-500">
                        No exam head assigned
                      </p>
                    )}
                  </div>

                  {/* Invigilators */}
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h5 className="text-sm font-medium text-gray-700 flex items-center">
                      <Users className="h-4 w-4 mr-2 text-indigo-600" />
                      Invigilators
                    </h5>
                    {selectedSlot.invigilators &&
                    selectedSlot.invigilators.length > 0 ? (
                      <ul className="mt-2 space-y-2">
                        {selectedSlot.invigilators.map((invig) => (
                          <li
                            key={invig.id}
                            className="flex items-center justify-between"
                          >
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {invig.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {invig.department}
                              </p>
                            </div>
                            <button
                              onClick={() =>
                                selectedSlot.id &&
                                removeInvigilator(selectedSlot.id, invig.id)
                              }
                              className="text-red-600 hover:text-red-800 text-xs"
                            >
                              Remove
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 text-sm text-gray-500">
                        No invigilators assigned
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Available Faculty */}
              <div>
                <h4 className="text-base font-medium text-gray-900 mb-4">
                  Available Faculty
                </h4>

                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  </div>
                ) : availableFaculty.length === 0 ? (
                  <div className="bg-white rounded-lg p-6 text-center border border-gray-300">
                    <p className="text-gray-500">
                      No faculty available for this time slot
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {availableFaculty.map((faculty) => (
                      <div
                        key={faculty.id}
                        className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {faculty.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {faculty.department}
                          </p>
                          <div className="mt-1 flex items-center">
                            <div className="mr-2 text-xs">
                              <span className="text-gray-500">Workload:</span>{" "}
                              {faculty.currentWorkload}/
                              {faculty.workloadCapacity}
                            </div>
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-indigo-600 h-2 rounded-full"
                                style={{
                                  width: `${
                                    (faculty.currentWorkload /
                                      faculty.workloadCapacity) *
                                    100
                                  }%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-2">
                          {faculty.isExamHead && (
                            <button
                              onClick={() => assignExamHead(faculty.id)}
                              className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                            >
                              <Briefcase className="h-3 w-3 mr-1" />
                              As Head
                            </button>
                          )}
                          <button
                            onClick={() => assignFaculty(faculty.id)}
                            className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200"
                          >
                            <User className="h-3 w-3 mr-1" />
                            As Faculty
                          </button>
                          {faculty.isInvigilator && (
                            <button
                              onClick={() => addInvigilator(faculty.id)}
                              className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200"
                            >
                              <Users className="h-3 w-3 mr-1" />
                              As Invigilator
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => setShowFacultyModal(false)}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function Schedules() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true); // Start with loading state
  const [error, setError] = useState<string | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(
    null
  );

  // Form state for schedule generation
  const [formData, setFormData] = useState({
    scheduleName: "",
    startDate: "",
    endDate: "",
    programIds: ["cs", "it"],
    includeWeekends: false,
  });

  // Load schedules when component mounts
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await ScheduleService.getAllSchedules();
        setSchedules(data);
      } catch (err) {
        console.error("Failed to fetch schedules:", err);
        setError("Failed to load schedules. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Handle input changes for form
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    if (type === "checkbox") {
      setFormData({
        ...formData,
        [name]: (e.target as HTMLInputElement).checked,
      });
    } else if (name === "programIds") {
      // Handle multi-select for programs
      const select = e.target as HTMLSelectElement;
      const selectedOptions = Array.from(select.selectedOptions).map(
        (option) => option.value
      );
      setFormData({
        ...formData,
        programIds: selectedOptions,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Generate a new schedule
  const handleGenerateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await ScheduleService.generateSchedule(
        formData.startDate,
        formData.endDate,
        formData.scheduleName,
        {
          programIds: formData.programIds,
          includeWeekends: formData.includeWeekends,
        }
      );

      // Refresh the schedules list
      const newData = await ScheduleService.getAllSchedules();
      setSchedules(newData);

      // Close the modal
      setIsGenerating(false);

      // Reset form
      setFormData({
        scheduleName: "",
        startDate: "",
        endDate: "",
        programIds: ["cs", "it"],
        includeWeekends: false,
      });
    } catch (err) {
      console.error("Failed to generate schedule:", err);
      setError("Failed to generate schedule. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle actions: view, export, email
  const handleViewSchedule = (schedule: Schedule) => {
    // Set the selected schedule to display its exam slots
    setSelectedSchedule(schedule);
  };

  const handleExportSchedule = async (id: number) => {
    try {
      await ScheduleService.exportSchedule(id);
    } catch (err) {
      console.error("Failed to export schedule:", err);
      setError("Failed to export schedule. Please try again.");
    }
  };

  const handleEmailSchedule = async (id: number) => {
    setLoading(true);
    try {
      await ScheduleService.emailSchedule(id);
      alert("Schedule has been emailed successfully!");
    } catch (err) {
      console.error("Failed to email schedule:", err);
      setError("Failed to email schedule. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Exam Schedules</h2>
        <button
          onClick={() => setIsGenerating(true)}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Generate New Schedule
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {/* Calendar View */}
      <ScheduleCalendar schedules={schedules} />

      {/* Suspense fallback for loading state */}
      <Suspense fallback={<LoadingPlaceholder />}>
        {loading ? (
          <LoadingPlaceholder />
        ) : (
          <div className="mt-8 flex flex-col">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                          Schedule Name
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Date Range
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Status
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {schedules.length === 0 && !loading ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-3 py-4 text-sm text-gray-500 text-center"
                          >
                            No schedules found. Generate a new one to get
                            started.
                          </td>
                        </tr>
                      ) : (
                        schedules.map((schedule) => (
                          <tr key={schedule.id}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                              {schedule.name}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {schedule.startDate} to {schedule.endDate}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                              <span
                                className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                  schedule.status &&
                                  schedule.status.toLowerCase() === "active"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {schedule.status || "N/A"}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              <div className="flex space-x-2">
                                <button
                                  className="text-gray-400 hover:text-gray-500"
                                  onClick={() => handleViewSchedule(schedule)}
                                >
                                  <Calendar className="h-5 w-5" />
                                </button>
                                <button
                                  className="text-gray-400 hover:text-gray-500"
                                  onClick={() =>
                                    handleExportSchedule(schedule.id)
                                  }
                                >
                                  <Download className="h-5 w-5" />
                                </button>
                                <button
                                  className="text-gray-400 hover:text-gray-500"
                                  onClick={() =>
                                    handleEmailSchedule(schedule.id)
                                  }
                                >
                                  <Mail className="h-5 w-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </Suspense>

      {/* Generate Schedule Modal */}
      {isGenerating && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Generate New Schedule
            </h3>
            <form className="space-y-4" onSubmit={handleGenerateSchedule}>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Schedule Name
                </label>
                <input
                  type="text"
                  name="scheduleName"
                  value={formData.scheduleName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Summer Exams 2023"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Programs
                </label>
                <select
                  multiple
                  name="programIds"
                  value={formData.programIds}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                >
                  <option value="cs">Computer Science</option>
                  <option value="it">Information Technology</option>
                </select>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="includeWeekends"
                  checked={formData.includeWeekends}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Include Weekends
                </label>
              </div>
              <div className="mt-5 sm:mt-6 space-y-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:text-sm disabled:bg-indigo-300"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Processing...
                    </>
                  ) : (
                    "Generate Schedule"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsGenerating(false)}
                  className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Exam Slot Management */}
      {selectedSchedule && <ExamSlotManagement schedule={selectedSchedule} />}
    </div>
  );
}

export default Schedules;
