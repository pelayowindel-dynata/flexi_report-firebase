// src/attendanceSummary.ts

import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import type {
  UserDoc,
  EventDoc,
  EventLog,
  StudentAttendance,
  AttendanceEntry,
} from "./types";

export async function fetchAttendanceSummary(): Promise<StudentAttendance[]> {
  // 1) Load all users into a lookup map
  const userSnap = await getDocs(collection(db, "users"));
  const usersById: Record<string, UserDoc> = {};
  userSnap.docs.forEach((doc) => {
    const data = doc.data() as any;
    usersById[doc.id] = {
      docId: doc.id,
      name: data.name,
    };
  });

  // 2) Load all events, defaulting `logs` to an empty array if missing
  const eventSnap = await getDocs(collection(db, "v2_event"));
  const events: EventDoc[] = eventSnap.docs.map((doc) => {
    const data = doc.data() as any;
    const rawLogs = data.logs;
    const logs: EventLog[] = Array.isArray(rawLogs) ? rawLogs : [];

    return {
      id:    data.id ?? doc.id,
      title: data.title,
      logs,
    };
  });

  // 3) Gather every studentId that appears in any event log
  const allStudentIds = new Set<string>();
  events.forEach((evt) =>
    evt.logs.forEach((log) => allStudentIds.add(log.userId))
  );

  // 4) Build per-student attendance summary
  const summary: StudentAttendance[] = [];
  allStudentIds.forEach((studentId) => {
    const studentName = usersById[studentId]?.name ?? "Unknown";

    const entries: AttendanceEntry[] = events.map((evt) => {
      const logsForStudent = evt.logs.filter((l) => l.userId === studentId);
      const loggedIn  = logsForStudent.some((l) => l.logType === "in");
      const loggedOut = logsForStudent.some((l) => l.logType === "out");

      let status: AttendanceEntry["status"];
      if (loggedIn && loggedOut) status = "complete";
      else if (loggedIn)         status = "onlyIn";
      else if (loggedOut)        status = "onlyOut";
      else                        status = "none";

      return {
        eventId:  evt.id,
        title:    evt.title,
        loggedIn,
        loggedOut,
        status,
      };
    });

    summary.push({
      studentDocId: studentId,
      studentName,
      events: entries,
    });
  });

  return summary;
}
