// src/App.tsx
import { useEffect, useState } from "react";
import { collection, getDoc, getDocs, orderBy, query } from "firebase/firestore";
import { AttendanceTable } from "./components/AttendanceTable";
import type { EventDoc, EventLog, UserDoc } from "./types";
import { db } from "./firebase";
import { AttendanceMatrix } from "./components/AttendanceMatrix";

function App() {
  // State holds an array of UserDoc
  const [students, setStudents] = useState<UserDoc[]>([]);
  const [schoolEvents, setSchoolEvents] = useState<EventDoc[]>([]);

  // 1) Fetch all students
  const getStudents = async (): Promise<UserDoc[]> => {
    const userSnap = await getDocs(collection(db, "users"));  // or "user" if that's your collection name
    return userSnap.docs.map((doc) => {
      const data = doc.data() as any;
      return {
        docId: doc.id,
        name: data.name,
      };
    });
  };
  // 2) Fetch all events, pulling in the nested `logs` array
  const getSchoolEvents = async (): Promise<EventDoc[]> => {

    const eventRef = collection(db, "v2_event");
    const logsQuery = query(eventRef, orderBy("date", "asc"));
    const eventSnap = await getDocs(logsQuery);

    const eventsWithLogs = await Promise.all(
      eventSnap.docs.map(async (evtDoc) => {
        const data = evtDoc.data() as any;

        // Reference to the logs subcollection
        const logsRef = collection(db, "v2_event", evtDoc.id, "logs");
        const logsQuery = query(logsRef, orderBy("userId", "asc"));

        // Execute it
        const logsSnap = await getDocs(logsQuery);

        // Map to your EventLog type
        const rawLogs: EventLog[] = logsSnap.docs.map((logDoc) =>
          logDoc.data() as EventLog
        );

        // (Optional) de-duplicate by userId + logType
        const seen = new Set<string>();
        const logs: EventLog[] = [];
        for (const log of rawLogs) {
          const key = `${log.userId}-${log.logType}`;
          if (!seen.has(key)) {
            seen.add(key);
            logs.push(log);
          }
        }

        return {
          id: data.id ?? evtDoc.id,
          title: data.title,
          logs,   // now unique per userId+logType
        };
      })
    );

    return eventsWithLogs;
  }

  // On mount, load both collections
  useEffect(() => {
    getStudents()
      .then(setStudents)
      .catch(console.error);

    getSchoolEvents()
      .then(setSchoolEvents)
      .catch(console.error);
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h1>Attendance Summary</h1>

      <section style={{ marginBottom: 24 }}>
        <h2>Students ({students.length})</h2>
        {/* <ul>
          {students.map((stu) => (
            <li key={stu.docId}>
              {stu.name ?? "No Name"} <em>({stu.docId})</em>
            </li>
          ))}
        </ul> */}
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2>Events ({schoolEvents.length})</h2>
        <ul>
          {schoolEvents.map((evt) => (
            <li key={evt.id}>
              {evt.title} — {evt.logs.length} log{evt.logs.length !== 1 ? "s" : ""}
            </li>
          ))}
        </ul>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2>Attendance Matrix</h2>
        <AttendanceMatrix students={students} events={schoolEvents} />
      </section>


      {/* <AttendanceTable /> */}
    </div>
  );
}

export default App;
