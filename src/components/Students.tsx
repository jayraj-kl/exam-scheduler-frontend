import React, { useState, useEffect } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Users,
  BookOpen,
  UserCheck,
  Award,
  BarChart2,
} from "lucide-react";
import { Student, StudentService } from "../services/studentService";

// Dashboard component to display student statistics
const StudentsDashboard = ({ students }: { students: Student[] }) => {
  // State for statistics data
  const [stats, setStats] = useState<{
    totalCount: number;
    byProgram: Record<string, number>;
    bySemester: Record<string, number>;
  }>({
    totalCount: 0,
    byProgram: {},
    bySemester: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate some derived statistics
  const activeStudents = students.filter(
    (student) => student.status === "Active"
  ).length;

  useEffect(() => {
    const fetchStatistics = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch all statistics in parallel
        const [totalStats, programStats, semesterStats] = await Promise.all([
          StudentService.getTotalStudentsCount(),
          StudentService.getStudentsByProgram(),
          StudentService.getStudentsBySemester(),
        ]);

        setStats({
          totalCount: totalStats.totalStudents,
          byProgram: programStats.studentsByProgram,
          bySemester: semesterStats.studentsBySemester,
        });
      } catch (err) {
        console.error("Failed to fetch student statistics:", err);
        setError("Failed to load statistics. Using demo data instead.");

        // Fallback to demo data if API fails
        setStats({
          totalCount: students.length || 255,
          byProgram: {
            "Computer Science": 120,
            "Information Technology": 85,
          },
          bySemester: {
            "1": 45,
            "2": 38,
            "3": 42,
            "4": 35,
            "5": 30,
            "6": 25,
            "7": 22,
            "8": 18,
          },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [students.length]);

  // Convert program stats into array for display
  const programDistribution = Object.entries(stats.byProgram).map(
    ([program, count]) => ({
      program,
      count,
    })
  );

  // Convert semester stats into array for display
  const semesterDistribution = Object.entries(stats.bySemester)
    .map(([semester, count]) => ({
      semester: parseInt(semester, 10),
      count,
    }))
    .sort((a, b) => a.semester - b.semester);

  // Get the highest semester count for calculating percentage widths
  const maxSemesterCount =
    semesterDistribution.length > 0
      ? Math.max(...semesterDistribution.map((item) => item.count))
      : 1;

  return (
    <div className="mt-6">
      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        {/* Total Students Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-indigo-600" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Students
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {loading ? (
                        <div className="animate-pulse h-6 bg-gray-200 rounded w-16"></div>
                      ) : (
                        stats.totalCount
                      )}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Active Students Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserCheck
                  className="h-6 w-6 text-green-600"
                  aria-hidden="true"
                />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Students
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {loading ? (
                        <div className="animate-pulse h-6 bg-gray-200 rounded w-16"></div>
                      ) : (
                        activeStudents || 230
                      )}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Average GPA Card (dummy data) */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Award className="h-6 w-6 text-yellow-600" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Average GPA
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      3.42
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Subjects Enrolled Card (dummy data) */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BookOpen
                  className="h-6 w-6 text-blue-600"
                  aria-hidden="true"
                />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Courses
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">28</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Program and Semester distributions */}
      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* Program Distribution */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Students by Program
              </h3>
              <BarChart2 className="ml-2 h-5 w-5 text-gray-400" />
            </div>
            <div className="mt-6 space-y-8">
              {loading ? (
                <div className="space-y-4">
                  <div className="animate-pulse h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="animate-pulse h-4 bg-gray-200 rounded w-full"></div>
                  <div className="animate-pulse h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ) : (
                programDistribution.map((program, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-600">
                        {program.program}
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {program.count} students
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="relative pt-1">
                        <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                          <div
                            style={{
                              width: `${
                                (program.count /
                                  Object.values(stats.byProgram).reduce(
                                    (a, b) => a + b,
                                    0
                                  )) *
                                100
                              }%`,
                            }}
                            className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                              index % 2 === 0 ? "bg-indigo-500" : "bg-blue-500"
                            }`}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Semester Distribution */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Students by Semester
              </h3>
              <BarChart2 className="ml-2 h-5 w-5 text-gray-400" />
            </div>
            {loading ? (
              <div className="mt-6 h-24 flex justify-around">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="w-8 animate-pulse bg-gray-200 rounded-t"
                    style={{ height: `${50 + Math.random() * 50}%` }}
                  ></div>
                ))}
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-4 gap-x-4 gap-y-5">
                {semesterDistribution.map((item) => (
                  <div key={item.semester} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-600">
                        Sem {item.semester}
                      </div>
                      <div className="text-xs font-medium text-gray-500">
                        {item.count}
                      </div>
                    </div>
                    <div className="h-24 flex items-end">
                      <div
                        className={`w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t`}
                        style={{
                          height: `${(item.count / maxSemesterCount) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Show error if any */}
      {error && <div className="mt-2 text-xs text-amber-600">{error}</div>}
    </div>
  );
};

function Students() {
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);

  // Form state
  const [formData, setFormData] = useState<Student>({
    studentId: "",
    name: "",
    email: "",
    program: { id: 1 },
    semester: 1,
    status: "Active",
    phone: "",
    enrollmentDate: "",
    address: "",
  });

  // Load students when component mounts
  useEffect(() => {
    fetchStudents();
  }, []);

  // Fetch all students
  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await StudentService.getAllStudents();
      setStudents(data);
    } catch (err) {
      console.error("Failed to fetch students:", err);
      setError("Failed to load students. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes for form
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    if (name === "programId") {
      // Handle program selection
      setFormData({
        ...formData,
        program: { id: parseInt(value, 10) },
      });
    } else if (type === "number") {
      setFormData({
        ...formData,
        [name]: parseInt(value, 10),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Add a new student
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await StudentService.createStudent(formData);

      // Refresh the students list
      await fetchStudents();

      // Close the modal
      setIsAdding(false);

      // Reset form
      setFormData({
        studentId: "",
        name: "",
        email: "",
        program: { id: 1 },
        semester: 1,
        status: "Active",
        phone: "",
        enrollmentDate: "",
        address: "",
      });
    } catch (err) {
      console.error("Failed to add student:", err);
      setError("Failed to add student. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Open edit modal with student data
  const handleEditClick = (student: Student) => {
    setCurrentStudent(student);
    setFormData({
      studentId: student.studentId,
      name: student.name,
      email: student.email,
      program: student.program,
      semester: student.semester,
      status: student.status,
      phone: student.phone || "",
      enrollmentDate: student.enrollmentDate || "",
      address: student.address || "",
    });
    setIsEditing(true);
  };

  // Update an existing student
  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStudent?.id) return;

    setLoading(true);
    setError(null);

    try {
      await StudentService.updateStudent(currentStudent.id, formData);

      // Refresh the students list
      await fetchStudents();

      // Close the modal
      setIsEditing(false);
      setCurrentStudent(null);

      // Reset form
      setFormData({
        studentId: "",
        name: "",
        email: "",
        program: { id: 1 },
        semester: 1,
        status: "Active",
        phone: "",
        enrollmentDate: "",
        address: "",
      });
    } catch (err) {
      console.error("Failed to update student:", err);
      setError("Failed to update student. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Delete a student
  const handleDeleteStudent = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this student?")) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await StudentService.deleteStudent(id);

      // Refresh the students list
      await fetchStudents();
    } catch (err) {
      console.error("Failed to delete student:", err);
      setError("Failed to delete student. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Students</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Student
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {/* Dashboard Stats */}
      <StudentsDashboard students={students} />

      {/* Loading indicator */}
      {loading && (
        <div className="flex justify-center mt-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
        </div>
      )}

      <div className="mt-8 flex flex-col">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                      Student ID
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Name
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Email
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Program
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Semester
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
                  {students.length === 0 && !loading ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-3 py-4 text-sm text-gray-500 text-center"
                      >
                        No students found. Add a new one to get started.
                      </td>
                    </tr>
                  ) : (
                    students.map((student) => (
                      <tr key={student.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                          {student.studentId}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {student.name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {student.email}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {student.program.name ||
                            `Program ID: ${student.program.id}`}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {student.semester}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                            {student.status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <div className="flex space-x-2">
                            <button
                              className="text-gray-400 hover:text-gray-500"
                              onClick={() => handleEditClick(student)}
                            >
                              <Pencil className="h-5 w-5" />
                            </button>
                            <button
                              className="text-gray-400 hover:text-gray-500"
                              onClick={() =>
                                student.id && handleDeleteStudent(student.id)
                              }
                            >
                              <Trash2 className="h-5 w-5" />
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

      {/* Add Student Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Add New Student
            </h3>
            <form className="space-y-4" onSubmit={handleAddStudent}>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Student ID
                </label>
                <input
                  type="text"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="CS2023001"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="john.doe@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="1234567890"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Program
                </label>
                <select
                  name="programId"
                  value={formData.program.id}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                >
                  <option value="1">Computer Science</option>
                  <option value="2">Information Technology</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Semester
                </label>
                <input
                  type="number"
                  name="semester"
                  value={formData.semester}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  min="1"
                  max="8"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Enrollment Date
                </label>
                <input
                  type="date"
                  name="enrollmentDate"
                  value={formData.enrollmentDate}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="123 Main St"
                />
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
                    "Add Student"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {isEditing && currentStudent && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Edit Student
            </h3>
            <form className="space-y-4" onSubmit={handleUpdateStudent}>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Student ID
                </label>
                <input
                  type="text"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Program
                </label>
                <select
                  name="programId"
                  value={formData.program.id}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                >
                  <option value="1">Computer Science</option>
                  <option value="2">Information Technology</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Semester
                </label>
                <input
                  type="number"
                  name="semester"
                  value={formData.semester}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  min="1"
                  max="8"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Enrollment Date
                </label>
                <input
                  type="date"
                  name="enrollmentDate"
                  value={formData.enrollmentDate}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
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
                    "Update Student"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Students;
