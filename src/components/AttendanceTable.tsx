/*
 * src/components/AttendanceTable.tsx
 * UI component to display the summary
 */
import React, { useEffect, useState } from "react";
import type { StudentAttendance } from "../types";
import { fetchAttendanceSummary } from "../attendanceSummary";

export function AttendanceTable() {
  const [data, setData] = useState<StudentAttendance[]>([]);

  useEffect(() => {
    fetchAttendanceSummary().then(setData).catch(console.error);
  }, []);

  return (
    <div>
      {data.map(stu => (
        <div key={stu.studentDocId} style={{ marginBottom: 24 }}>
          <h3>{stu.studentName} ({stu.studentDocId})</h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left" }}>Event</th>
                <th>In</th>
                <th>Out</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {stu.events.map(evt => (
                <tr key={evt.eventId}>
                  <td>{evt.title}</td>
                  <td style={{ textAlign: "center" }}>{evt.loggedIn ? "✓" : "—"}</td>
                  <td style={{ textAlign: "center" }}>{evt.loggedOut ? "✓" : "—"}</td>
                  <td style={{ textAlign: "center" }}>{evt.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

