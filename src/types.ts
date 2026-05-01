export type Room = {
  id: string;
  name: string;
  color: string;
};

export type Booking = {
  id: string;
  roomId: string;
  userName: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  remarks?: string;
};
