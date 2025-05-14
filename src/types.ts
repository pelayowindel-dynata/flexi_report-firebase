/*
 * src/types.ts
 * Shared TypeScript types
 */
import { Timestamp } from "firebase/firestore";

export type UserDoc = {
  docId: string;
  name?: string;
};

export type EventLog = {
  logType: "in" | "out";
  timestamp: Timestamp;
  userId: string;
};

export type EventDoc = {
  id: string;
  title: string;
  logs: EventLog[];
};

export type AttendanceEntry = {
  eventId: string;
  title: string;
  loggedIn: boolean;
  loggedOut: boolean;
  status: "complete" | "onlyIn" | "onlyOut" | "none";
};

export type StudentAttendance = {
  studentDocId: string;
  studentName: string;
  events: AttendanceEntry[];
};

