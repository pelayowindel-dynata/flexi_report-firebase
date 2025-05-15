// src/components/AttendanceMatrix.tsx
import React from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import type { UserDoc, EventDoc, EventLog } from "../types";

interface Props {
  students: UserDoc[];
  events: EventDoc[];
}

export function AttendanceMatrix({ students, events }: Props) {
  // 1) Build full student list, including any unknown userIds from logs
  const allLogUserIds = new Set<string>();
  events.forEach(evt =>
    evt.logs.forEach((log: EventLog) => allLogUserIds.add(log.userId))
  );
  const knownIds = new Set(students.map(s => s.docId));
  const unknownStudents = Array.from(allLogUserIds)
    .filter(id => !knownIds.has(id))
    .map(id => ({ docId: id, name: id } as UserDoc));
  const fullStudents = [...students, ...unknownStudents];

  // Export to Excel handler
  const exportToExcel = async () => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Attendance");

    // Header row 1: Student label + event titles spanning 2 cols
    ws.mergeCells(1, 1, 2, 1);
    const titleCell = ws.getCell(1, 1);
    titleCell.value = "Student";
    titleCell.alignment = { vertical: "middle", horizontal: "center" };
    titleCell.font = { bold: true };

    events.forEach((evt, idx) => {
      const startCol = 2 + idx * 2;
      const endCol = startCol + 1;
      ws.mergeCells(1, startCol, 1, endCol);
      const cell = ws.getCell(1, startCol);
      cell.value = evt.title;
      cell.alignment = { horizontal: "center" };
      cell.font = { bold: true };
      // thin border
      [1, startCol].forEach(() => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });

    // Header row 2: In / Out labels
    events.forEach((_, idx) => {
      const inCol = 2 + idx * 2;
      const outCol = inCol + 1;
      [
        { col: inCol, label: "In" },
        { col: outCol, label: "Out" },
      ].forEach(({ col, label }) => {
        const c = ws.getCell(2, col);
        c.value = label;
        c.alignment = { horizontal: "center" };
        c.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });

    // Data rows
    fullStudents.forEach((stu, rowIdx) => {
      const rowNumber = 3 + rowIdx;
      const row = ws.getRow(rowNumber);
      // Student name cell
      const nameCell = row.getCell(1);
      nameCell.value = stu.name || stu.docId;
      nameCell.alignment = { vertical: "middle", horizontal: "left" };
      nameCell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };

      // Event in/out cells
      events.forEach((evt, evtIdx) => {
        const logsFor = evt.logs.filter(l => l.userId === stu.docId);
        const hasIn = logsFor.some(l => l.logType === "in");
        const hasOut = logsFor.some(l => l.logType === "out");

        const inCell = row.getCell(2 + evtIdx * 2);
        inCell.value = hasIn ? "0" : "1";
        inCell.alignment = { horizontal: "center" };
        inCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: hasIn ? "FF00FF00" : "FFFF7F50" },
        };
        inCell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };

        const outCell = row.getCell(3 + evtIdx * 2);
        outCell.value = hasOut ? "0" : "1";
        outCell.alignment = { horizontal: "center" };
        outCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: hasOut ? "FF00FF00" : "FFFF7F50" },
        };
        outCell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });

    // Auto-width
    ws.columns.forEach(col => {
      let max = 10;
      col.eachCell?.({ includeEmpty: false }, cell => {
        const len = cell.value?.toString().length ?? 0;
        if (len > max) max = len;
      });
      col.width = max + 2;
    });

    // Download
    const buffer = await wb.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), "attendance.xlsx");
  };

  return (
    <div>
      <button onClick={exportToExcel} style={{ marginBottom: 16 }}>
        📥 Export to Excel
      </button>

      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ccc", padding: 8, background: "#f5f5f5" }}>
              Student ↓ \ Event →
            </th>
            {events.map(evt => (
              <th
                key={evt.id}
                colSpan={2}
                style={{
                  border: "1px solid #ccc",
                  padding: 8,
                  background: "#f5f5f5",
                  textAlign: "center",
                }}
              >
                {evt.title}
              </th>
            ))}
          </tr>
          <tr>
            <th style={{ border: "1px solid #ccc", padding: 8 }} />
            {events.flatMap(evt => [
              <th
                key={`${evt.id}-in`}
                style={{
                  border: "1px solid #ccc",
                  padding: 8,
                  background: "#fafafa",
                  textAlign: "center",
                }}
              >
                In
              </th>,
              <th
                key={`${evt.id}-out`}
                style={{
                  border: "1px solid #ccc",
                  padding: 8,
                  background: "#fafafa",
                  textAlign: "center",
                }}
              >
                Out
              </th>,
            ])}
          </tr>
        </thead>
        <tbody>
          {fullStudents.map(stu => (
            <tr key={stu.docId}>
              <td style={{ border: "1px solid #ccc", padding: 8, fontWeight: "bold" }}>
                {stu.name ?? stu.docId}
              </td>

              {events.flatMap(evt => {
                const logsFor = evt.logs.filter(l => l.userId === stu.docId);
                const loggedIn = logsFor.some(l => l.logType === "in");
                const loggedOut = logsFor.some(l => l.logType === "out");

                return [
                  <td
                    key={`${stu.docId}-${evt.id}-in`}
                    style={{
                      border: "1px solid #ccc",
                      textAlign: "center",
                      padding: 8,
                      background: loggedIn ? "green" : "coral",
                    }}
                  >
                    {loggedIn ? "0" : "1"}
                  </td>,
                  <td
                    key={`${stu.docId}-${evt.id}-out`}
                    style={{
                      border: "1px solid #ccc",
                      textAlign: "center",
                      padding: 8,
                      background: loggedOut ? "green" : "coral",
                    }}
                  >
                    {loggedOut ? "0" : "1"}
                  </td>,
                ];
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
