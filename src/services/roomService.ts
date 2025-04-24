// Types for the Room API
export interface Room {
  id?: number;
  roomNumber: string;
  building: string;
  floor: string;
  seatingCapacity: number;
  roomType: string;
  isAvailable: boolean;
}

// Room statistics interfaces
export interface TotalRoomsStats {
  totalRooms: number;
}

export interface TotalCapacityStats {
  totalCapacity: number;
}

export interface AvailableRoomsStats {
  availableRooms: number;
}

// Room API service
import { apiRequest } from "./api";

export const RoomService = {
  // Get all rooms
  getAllRooms: () => {
    return apiRequest<Room[]>("/rooms");
  },

  // Get room by ID
  getRoomById: (id: number) => {
    return apiRequest<Room>(`/rooms/${id}`);
  },

  // Create a new room
  createRoom: (room: Room) => {
    return apiRequest<Room>("/rooms", "POST", room);
  },

  // Update an existing room
  updateRoom: (id: number, room: Room) => {
    return apiRequest<Room>(`/rooms/${id}`, "PUT", room);
  },

  // Delete a room
  deleteRoom: (id: number) => {
    return apiRequest<void>(`/rooms/${id}`, "DELETE");
  },

  // Toggle room availability - toggles between available and occupied states
  toggleRoomAvailability: (id: number, newAvailability: boolean) => {
    return apiRequest<Room>(`/rooms/${id}/availability`, "PUT", {
      isAvailable: newAvailability,
    });
  },

  // Get total rooms count
  getTotalRoomsCount: () => {
    return apiRequest<TotalRoomsStats>("/rooms/stats/total-rooms");
  },

  // Get total capacity of all rooms
  getTotalCapacity: () => {
    return apiRequest<TotalCapacityStats>("/rooms/stats/total-capacity");
  },

  // Get count of available rooms
  getAvailableRoomsCount: () => {
    return apiRequest<AvailableRoomsStats>("/rooms/stats/available-rooms");
  },
};
