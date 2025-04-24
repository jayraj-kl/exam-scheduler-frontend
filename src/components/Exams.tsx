import React, { useState, useEffect } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Clock,
  Calendar,
  BookOpen,
  PieChart,
} from "lucide-react";
import {
  Exam,
  LegacyExam,
  ExamService,
  ExamStats,
  ExamStatsRange,
  FacultyWorkload,
} from "../services/examService";
import { Subject } from "../services/subjectService";

// Dashboard component to display exam statistics
const ExamsDashboard = ({
  stats,
  subjectDistribution,
}: {
  stats: ExamStats;
  upcomingExams: Exam[];
  subjectDistribution: {
    subject: string;
    code: string;
    count: number;
    color: string;
  }[];
}) => {
  // Calculate total exams for percentage calculation
  const totalExamsCount = subjectDistribution.reduce(
    (sum, item) => sum + item.count,
    0
  );

  return (
    <div className="mt-6">
      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        {/* Total Exams Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BookOpen
                  className="h-6 w-6 text-indigo-600"
                  aria-hidden="true"
                />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Exams
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {stats.totalExams}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Scheduled Exams Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar
                  className="h-6 w-6 text-green-600"
                  aria-hidden="true"
                />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Upcoming Exams
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {stats.upcomingExams}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Exams Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-yellow-600" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pending
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {stats.pendingExams}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Date Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <PieChart
                  className="h-6 w-6 text-blue-600"
                  aria-hidden="true"
                />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Last Updated
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {stats.timestamp}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subject distribution and upcoming exams */}
      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* Subject Distribution */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Exams by Subject
            </h3>
            <div className="mt-5">
              {subjectDistribution.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No subject data available.
                </p>
              ) : (
                subjectDistribution.map((item) => (
                  <div key={item.code} className="mb-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-600">
                        {item.subject} ({item.code})
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {item.count}
                      </div>
                    </div>
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`${item.color} h-2.5 rounded-full`}
                        style={{
                          width: `${
                            totalExamsCount > 0
                              ? (item.count / totalExamsCount) * 100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function Exams() {
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [exams, setExams] = useState<LegacyExam[]>([]);
  const [upcomingExams, setUpcomingExams] = useState<Exam[]>([]);
  const [examStats, setExamStats] = useState<ExamStats>({
    totalExams: 0,
    upcomingExams: 0,
    pendingExams: 0,
    timestamp: new Date().toLocaleDateString(),
  });
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectDistribution, setSubjectDistribution] = useState<
    { subject: string; code: string; count: number; color: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentExam, setCurrentExam] = useState<LegacyExam | null>(null);
  const [selectedSubject] = useState<string>("");
  const [statusChangeLoading, setStatusChangeLoading] = useState<number | null>(
    null
  );

  // Faculty workload state
  const [showFacultyWorkload, setShowFacultyWorkload] = useState(false);
  const [facultyWorkload] = useState<FacultyWorkload[]>([]);
  const [loadingFacultyData] = useState(false);

  // Date range states
  const [startDate, setStartDate] = useState<string>("2025-05-22");
  const [endDate, setEndDate] = useState<string>("2025-05-29");
  const [rangeStats, setRangeStats] = useState<ExamStatsRange | null>(null);
  const [loadingRangeStats, setLoadingRangeStats] = useState(false);

  // Form state
  const [formData, setFormData] = useState<LegacyExam>({
    examName: "",
    subject: "",
    subjectEntity: undefined,
    examDate: "",
    duration: 120,
    startTime: "",
    status: "Pending",
    description: "",
  });

  // Load exams when component mounts
  useEffect(() => {
    fetchExams();
    fetchExamStats();
    fetchUpcomingExams();
    fetchSubjects();
    fetchSubjectDistribution();
  }, []);

  // Fetch exams when subject changes
  useEffect(() => {
    if (selectedSubject) {
      fetchExamsBySubject(selectedSubject);
      fetchUpcomingExamsBySubject(selectedSubject);
    } else {
      fetchUpcomingExams();
    }
  }, [selectedSubject]);

  // Fetch exam statistics
  const fetchExamStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ExamService.getExamStats();
      setExamStats(data);
    } catch (err) {
      console.error("Failed to fetch exam statistics:", err);
      setError("Failed to load exam statistics. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch all upcoming exams
  const fetchUpcomingExams = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ExamService.getUpcomingExams();
      setUpcomingExams(data);
    } catch (err) {
      console.error("Failed to fetch upcoming exams:", err);
      setError("Failed to load upcoming exams. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch upcoming exams by subject
  const fetchUpcomingExamsBySubject = async (subject: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await ExamService.getUpcomingExamsBySubject(subject);
      setUpcomingExams(data);
    } catch (err) {
      console.error(
        `Failed to fetch upcoming exams for subject ${subject}:`,
        err
      );
      setError(
        `Failed to load upcoming exams for ${subject}. Please try again later.`
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch exams by subject
  const fetchExamsBySubject = async (subject: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await ExamService.getExamsBySubject(subject);
      // We'll use this data for a different view later
      console.log("Exams for subject:", data);
    } catch (err) {
      console.error(`Failed to fetch exams for subject ${subject}:`, err);
      setError(`Failed to load exams for ${subject}. Please try again later.`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all exams
  const fetchExams = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ExamService.getAllExams();
      setExams(data);
    } catch (err) {
      console.error("Failed to fetch exams:", err);
      setError("Failed to load exams. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch all subjects
  const fetchSubjects = async () => {
    try {
      const data = await ExamService.getAllSubjects();
      setSubjects(data);
    } catch (err) {
      console.error("Failed to fetch subjects:", err);
      setError("Failed to load subjects. Please try again later.");
    }
  };

  // Fetch subject distribution
  const fetchSubjectDistribution = async () => {
    try {
      const data = await ExamService.getSubjectDistribution();
      setSubjectDistribution(data);
    } catch (err) {
      console.error("Failed to fetch subject distribution:", err);
      setError("Failed to load subject distribution. Please try again later.");
    }
  };

  // Fetch exams by date range
  const fetchExamsByDateRange = async () => {
    setLoadingRangeStats(true);
    setError(null);
    try {
      const data = await ExamService.getExamStatsByDateRange(
        startDate,
        endDate
      );
      setRangeStats(data);
    } catch (err) {
      console.error(`Failed to fetch exams for date range:`, err);
      setError(
        `Failed to load exams for the selected date range. Please try again later.`
      );
    } finally {
      setLoadingRangeStats(false);
    }
  };

  // Handle start date change
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
  };

  // Handle end date change
  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
  };

  // Handle input changes for form
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target as HTMLInputElement &
      HTMLTextAreaElement;

    if (name === "subjectId") {
      // When a subject is selected from dropdown
      const selectedSubject = subjects.find(
        (subject) => subject.id === parseInt(value, 10)
      );

      if (selectedSubject) {
        setFormData({
          ...formData,
          subject: selectedSubject.name, // Keep the subject string for backward compatibility
          subjectEntity: {
            id: selectedSubject.id,
            name: selectedSubject.name,
            code: selectedSubject.code,
          },
        });
      }
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

  // Add a new exam
  const handleAddExam = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await ExamService.createExam(formData);

      // Refresh the exams list and stats
      await fetchExams();
      await fetchExamStats();
      await fetchUpcomingExams();
      await fetchSubjectDistribution();

      // Close the modal
      setIsAdding(false);

      // Reset form
      setFormData({
        examName: "",
        subject: "",
        subjectEntity: undefined,
        examDate: "",
        duration: 120,
        startTime: "",
        status: "Pending",
        description: "",
      });
    } catch (err) {
      console.error("Failed to add exam:", err);
      setError("Failed to add exam. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Open edit modal with exam data
  const handleEditClick = (exam: LegacyExam) => {
    setCurrentExam(exam);
    setFormData({
      examName: exam.examName,
      subject: exam.subject,
      subjectEntity: exam.subjectEntity,
      examDate: exam.examDate,
      duration: exam.duration,
      startTime: exam.startTime,
      status: exam.status,
      description: exam.description || "",
    });
    setIsEditing(true);
  };

  // Update an existing exam
  const handleUpdateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentExam?.id) return;

    setLoading(true);
    setError(null);

    try {
      await ExamService.updateExam(currentExam.id, formData);

      // Refresh the exams list and stats
      await fetchExams();
      await fetchExamStats();
      await fetchUpcomingExams();
      await fetchSubjectDistribution();

      if (selectedSubject) {
        await fetchUpcomingExamsBySubject(selectedSubject);
      }

      // Close the modal
      setIsEditing(false);
      setCurrentExam(null);

      // Reset form
      setFormData({
        examName: "",
        subject: "",
        subjectEntity: undefined,
        examDate: "",
        duration: 120,
        startTime: "",
        status: "Pending",
        description: "",
      });
    } catch (err) {
      console.error("Failed to update exam:", err);
      setError("Failed to update exam. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Delete an exam
  const handleDeleteExam = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this exam?")) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await ExamService.deleteExam(id);

      // Refresh the exams list and stats
      await fetchExams();
      await fetchExamStats();
      await fetchUpcomingExams();
      await fetchSubjectDistribution();

      if (selectedSubject) {
        await fetchUpcomingExamsBySubject(selectedSubject);
      }
    } catch (err) {
      console.error("Failed to delete exam:", err);
      setError("Failed to delete exam. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle status change
  const handleStatusChange = async (id: number, newStatus: string) => {
    setStatusChangeLoading(id);
    setError(null);

    try {
      await ExamService.updateExamStatus(id, newStatus);

      // Refresh the exams list and stats
      await fetchExams();
      await fetchExamStats();
      await fetchUpcomingExams();
      await fetchSubjectDistribution();

      if (selectedSubject) {
        await fetchUpcomingExamsBySubject(selectedSubject);
      }
    } catch (err) {
      console.error("Failed to update exam status:", err);
      setError("Failed to update exam status. Please try again.");
    } finally {
      setStatusChangeLoading(null);
    }
  };

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Exams</h2>
        <div className="flex items-center">
          <div className="mr-4">
            {/* <button
              onClick={() => fetchFacultyWorkload()}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-2"
            >
              <PieChart className="h-4 w-4 mr-2" />
              Faculty Workload
            </button> */}
          </div>
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Exam
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {/* Dashboard Stats */}
      <ExamsDashboard
        stats={examStats}
        upcomingExams={upcomingExams}
        subjectDistribution={subjectDistribution}
      />

      {/* Date Range Stats Section */}
      <div className="mt-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Exam Statistics by Date Range
            </h3>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={handleStartDateChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={handleEndDateChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <button
                  type="button"
                  onClick={fetchExamsByDateRange}
                  disabled={loadingRangeStats}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
                >
                  {loadingRangeStats ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Loading...
                    </>
                  ) : (
                    "Get Statistics"
                  )}
                </button>
              </div>
            </div>

            {/* Range stats results */}
            {rangeStats && (
              <div className="mt-6">
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="mb-4">
                    <h4 className="text-base font-medium text-gray-900">
                      Summary
                    </h4>
                    <p className="mt-1 text-sm text-gray-500">
                      {rangeStats.startDate} to {rangeStats.endDate}
                    </p>
                    <p className="mt-1 text-sm text-gray-700">
                      Total Exams in Range:{" "}
                      <span className="font-semibold">
                        {rangeStats.totalExamsInRange}
                      </span>
                    </p>
                  </div>

                  {rangeStats.exams.length > 0 ? (
                    <div>
                      <h4 className="text-base font-medium text-gray-900 mb-2">
                        Exams in Selected Range
                      </h4>
                      <div className="max-h-60 overflow-y-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th
                                scope="col"
                                className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Subject
                              </th>
                              <th
                                scope="col"
                                className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Date
                              </th>
                              <th
                                scope="col"
                                className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Time
                              </th>
                              <th
                                scope="col"
                                className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Room
                              </th>
                              <th
                                scope="col"
                                className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Students
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {rangeStats.exams.map((exam) => (
                              <tr key={exam.id || `exam-${Math.random()}`}>
                                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {exam.subject?.name} ({exam.subject?.code})
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                  {exam.examDate}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                  {exam.startTime} - {exam.endTime}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                  {exam.room?.roomNumber}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                  {exam.studentCount}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No exams found in the selected date range.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loading indicator */}

      <div className="mt-8 flex flex-col">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                      Exam Name
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Subject
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Date
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Time
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Duration
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
                  {exams.length === 0 && !loading ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-3 py-4 text-sm text-gray-500 text-center"
                      >
                        No exams found. Add a new one to get started.
                      </td>
                    </tr>
                  ) : (
                    exams.map((exam) => (
                      <tr key={exam.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                          {exam.examName}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {exam.subject}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {exam.examDate}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {exam.startTime}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {exam.duration} min
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <select
                            value={exam.status}
                            onChange={(e) =>
                              exam.id &&
                              handleStatusChange(exam.id, e.target.value)
                            }
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            disabled={statusChangeLoading === exam.id}
                          >
                            <option value="Scheduled">Scheduled</option>
                            <option value="Pending">Pending</option>
                          </select>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <div className="flex space-x-2">
                            <button
                              className="text-gray-400 hover:text-gray-500"
                              onClick={() => handleEditClick(exam)}
                            >
                              <Pencil className="h-5 w-5" />
                            </button>
                            <button
                              className="text-gray-400 hover:text-gray-500"
                              onClick={() =>
                                exam.id && handleDeleteExam(exam.id)
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

      {/* Add Exam Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Add New Exam
            </h3>
            <form className="space-y-4" onSubmit={handleAddExam}>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Exam Name
                </label>
                <input
                  type="text"
                  name="examName"
                  value={formData.examName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Midterm Exam"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Subject
                </label>
                <select
                  name="subjectId"
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                  value={formData.subjectEntity?.id || ""}
                >
                  <option value="">Select a subject</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name} ({subject.code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Exam Date
                </label>
                <input
                  type="date"
                  name="examDate"
                  value={formData.examDate}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Start Time
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  min="30"
                  step="30"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  rows={3}
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
                    "Add Exam"
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

      {/* Edit Exam Modal */}
      {isEditing && currentExam && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Edit Exam
            </h3>
            <form className="space-y-4" onSubmit={handleUpdateExam}>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Exam Name
                </label>
                <input
                  type="text"
                  name="examName"
                  value={formData.examName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Subject
                </label>
                <select
                  name="subjectId"
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                  value={formData.subjectEntity?.id || ""}
                >
                  <option value="">Select a subject</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name} ({subject.code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Exam Date
                </label>
                <input
                  type="date"
                  name="examDate"
                  value={formData.examDate}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Start Time
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  min="30"
                  step="30"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  rows={3}
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
                    "Update Exam"
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

      {/* Faculty Workload Modal */}
      {showFacultyWorkload && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Faculty Workload
            </h3>
            {loadingFacultyData ? (
              <div className="flex justify-center items-center">
                <div className="animate-spin h-8 w-8 border-4 border-gray-300 border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {facultyWorkload.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No faculty workload data available.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {facultyWorkload.map((faculty) => (
                      <li key={faculty.id} className="flex justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          {faculty.name}
                        </span>
                        <span className="text-sm text-gray-500">
                          {faculty.examCount} hours
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            <div className="mt-5 sm:mt-6">
              <button
                type="button"
                onClick={() => setShowFacultyWorkload(false)}
                className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Exams;
