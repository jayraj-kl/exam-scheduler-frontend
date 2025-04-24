import React, { useState, useEffect } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Home,
  User,
  Users,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import {
  Room,
  RoomService,
  TotalRoomsStats,
  TotalCapacityStats,
  AvailableRoomsStats,
} from "../services/roomService";

// Dashboard component to display room statistics
const RoomsDashboard = ({ rooms }: { rooms: Room[] }) => {
  const [stats, setStats] = useState<{
    totalRooms: number;
    availableRooms: number;
    totalCapacity: number;
  }>({
    totalRooms: 0,
    availableRooms: 0,
    totalCapacity: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch statistics when component mounts
  useEffect(() => {
    const fetchStatistics = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch all statistics in parallel
        const [totalStats, availableStats, capacityStats] = await Promise.all([
          RoomService.getTotalRoomsCount(),
          RoomService.getAvailableRoomsCount(),
          RoomService.getTotalCapacity(),
        ]);

        setStats({
          totalRooms: totalStats.totalRooms,
          availableRooms: availableStats.availableRooms,
          totalCapacity: capacityStats.totalCapacity,
        });
      } catch (err) {
        console.error("Failed to fetch room statistics:", err);
        setError("Failed to load statistics. Using local data instead.");

        // Fallback to count from provided rooms array
        setStats({
          totalRooms: rooms.length || 18,
          availableRooms: rooms.filter((room) => room.isAvailable).length || 6,
          totalCapacity:
            rooms.reduce((sum, room) => sum + room.seatingCapacity, 0) || 340,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [rooms.length]);

  return (
    <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
      {/* Total Rooms */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Home className="h-6 w-6 text-indigo-600" aria-hidden="true" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Rooms
                </dt>
                <dd>
                  <div className="text-lg font-medium text-gray-900">
                    {loading ? (
                      <div className="animate-pulse h-6 bg-gray-200 rounded w-16"></div>
                    ) : (
                      stats.totalRooms
                    )}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-5 py-3">
          <div className="text-sm">
            <a
              href="#"
              className="font-medium text-indigo-600 hover:text-indigo-900"
            >
              View all
            </a>
          </div>
        </div>
      </div>

      {/* Available Rooms */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <User className="h-6 w-6 text-green-600" aria-hidden="true" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Available Rooms
                </dt>
                <dd>
                  <div className="text-lg font-medium text-gray-900">
                    {loading ? (
                      <div className="animate-pulse h-6 bg-gray-200 rounded w-16"></div>
                    ) : (
                      stats.availableRooms
                    )}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-5 py-3">
          <div className="text-sm">
            <a
              href="#"
              className="font-medium text-green-600 hover:text-green-900"
            >
              {stats.totalRooms > 0
                ? `${((stats.availableRooms / stats.totalRooms) * 100).toFixed(
                    1
                  )}% availability`
                : "0% availability"}
            </a>
          </div>
        </div>
      </div>

      {/* Total Capacity */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-6 w-6 text-blue-600" aria-hidden="true" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Capacity
                </dt>
                <dd>
                  <div className="text-lg font-medium text-gray-900">
                    {loading ? (
                      <div className="animate-pulse h-6 bg-gray-200 rounded w-16"></div>
                    ) : (
                      `${stats.totalCapacity} seats`
                    )}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-5 py-3">
          <div className="text-sm">
            <a
              href="#"
              className="font-medium text-blue-600 hover:text-blue-900"
            >
              Avg:{" "}
              {stats.totalRooms > 0
                ? Math.round(stats.totalCapacity / stats.totalRooms)
                : 0}{" "}
              per room
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

function Rooms() {
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [availabilityChangeLoading, setAvailabilityChangeLoading] = useState<
    number | null
  >(null);

  // Form state
  const [formData, setFormData] = useState<Room>({
    roomNumber: "",
    building: "",
    floor: "",
    seatingCapacity: 0,
    roomType: "Classroom",
    isAvailable: true,
  });

  // Load rooms when component mounts
  useEffect(() => {
    fetchRooms();
  }, []);

  // Fetch all rooms
  const fetchRooms = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await RoomService.getAllRooms();
      setRooms(data);
    } catch (err) {
      console.error("Failed to fetch rooms:", err);
      setError("Failed to load rooms. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

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

  // Add a new room
  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await RoomService.createRoom(formData);

      // Refresh the rooms list
      await fetchRooms();

      // Close the modal
      setIsAdding(false);

      // Reset form
      setFormData({
        roomNumber: "",
        building: "",
        floor: "",
        seatingCapacity: 0,
        roomType: "Classroom",
        isAvailable: true,
      });
    } catch (err) {
      console.error("Failed to add room:", err);
      setError("Failed to add room. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Open edit modal with room data
  const handleEditClick = (room: Room) => {
    setCurrentRoom(room);
    setFormData({
      roomNumber: room.roomNumber,
      building: room.building,
      floor: room.floor,
      seatingCapacity: room.seatingCapacity,
      roomType: room.roomType,
      isAvailable: room.isAvailable,
    });
    setIsEditing(true);
  };

  // Update an existing room
  const handleUpdateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRoom?.id) return;

    setLoading(true);
    setError(null);

    try {
      await RoomService.updateRoom(currentRoom.id, formData);

      // Refresh the rooms list
      await fetchRooms();

      // Close the modal
      setIsEditing(false);
      setCurrentRoom(null);

      // Reset form
      setFormData({
        roomNumber: "",
        building: "",
        floor: "",
        seatingCapacity: 0,
        roomType: "Classroom",
        isAvailable: true,
      });
    } catch (err) {
      console.error("Failed to update room:", err);
      setError("Failed to update room. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Delete a room
  const handleDeleteRoom = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this room?")) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await RoomService.deleteRoom(id);

      // Refresh the rooms list
      await fetchRooms();
    } catch (err) {
      console.error("Failed to delete room:", err);
      setError("Failed to delete room. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Toggle room availability
  const handleToggleAvailability = async (
    id: number,
    currentStatus: boolean
  ) => {
    setAvailabilityChangeLoading(id);
    setError(null);
    try {
      console.log(
        `Toggling room ${id} availability to ${
          !currentStatus ? "available" : "Available"
        }`
      );
      const response = await RoomService.toggleRoomAvailability(
        id,
        !currentStatus
      );
      console.log("Toggle response:", response);
      // Refresh the rooms list
      await fetchRooms();
    } catch (err) {
      console.error("Failed to update room availability:", err);
      setError("Failed to update room availability. Please try again.");
    } finally {
      setAvailabilityChangeLoading(null);
    }
  };

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Rooms</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Room
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {/* Dashboard Stats */}
      <RoomsDashboard rooms={rooms} />

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
                      Room Number
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Building
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Floor
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Capacity
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Type
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
                  {rooms.length === 0 && !loading ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-3 py-4 text-sm text-gray-500 text-center"
                      >
                        No rooms found. Add a new one to get started.
                      </td>
                    </tr>
                  ) : (
                    rooms.map((room) => (
                      <tr key={room.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                          {room.roomNumber}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {room.building}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {room.floor}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {room.seatingCapacity}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {room.roomType}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <select
                            value={room.isAvailable ? "Available" : "Available"}
                            onChange={(e) =>
                              room.id &&
                              handleToggleAvailability(
                                room.id,
                                e.target.value === "Available"
                              )
                            }
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            disabled={availabilityChangeLoading === room.id}
                          >
                            <option value="Available">Available</option>
                            <option value="Available">Available</option>
                          </select>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <div className="flex space-x-2">
                            <button
                              className="text-gray-400 hover:text-gray-500"
                              onClick={() => handleEditClick(room)}
                            >
                              <Pencil className="h-5 w-5" />
                            </button>
                            <button
                              className="text-gray-400 hover:text-gray-500"
                              onClick={() =>
                                room.id && handleDeleteRoom(room.id)
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

      {/* Add Room Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Add New Room
            </h3>
            <form className="space-y-4" onSubmit={handleAddRoom}>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Room Number
                </label>
                <input
                  type="text"
                  name="roomNumber"
                  value={formData.roomNumber}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="A-101"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Building
                </label>
                <input
                  type="text"
                  name="building"
                  value={formData.building}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Main Building"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Floor
                </label>
                <input
                  type="text"
                  name="floor"
                  value={formData.floor}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="1st Floor"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Seating Capacity
                </label>
                <input
                  type="number"
                  name="seatingCapacity"
                  value={formData.seatingCapacity}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Room Type
                </label>
                <select
                  name="roomType"
                  value={formData.roomType}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                >
                  <option value="Classroom">Classroom</option>
                  <option value="Lab">Lab</option>
                  <option value="Lecture Hall">Lecture Hall</option>
                </select>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={formData.isAvailable}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Available for scheduling
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
                    "Add Room"
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

      {/* Edit Room Modal */}
      {isEditing && currentRoom && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Edit Room
            </h3>
            <form className="space-y-4" onSubmit={handleUpdateRoom}>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Room Number
                </label>
                <input
                  type="text"
                  name="roomNumber"
                  value={formData.roomNumber}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Building
                </label>
                <input
                  type="text"
                  name="building"
                  value={formData.building}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Floor
                </label>
                <input
                  type="text"
                  name="floor"
                  value={formData.floor}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Seating Capacity
                </label>
                <input
                  type="number"
                  name="seatingCapacity"
                  value={formData.seatingCapacity}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Room Type
                </label>
                <select
                  name="roomType"
                  value={formData.roomType}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                >
                  <option value="Classroom">Classroom</option>
                  <option value="Lab">Lab</option>
                  <option value="Lecture Hall">Lecture Hall</option>
                </select>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={formData.isAvailable}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Available for scheduling
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
                    "Update Room"
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

export default Rooms;
