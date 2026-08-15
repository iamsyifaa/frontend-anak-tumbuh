import { ImportStudentError, ImportStudentRow, Student } from "../types/student";

export function collectImportIdentityErrors(
  row: ImportStudentRow,
  existingStudents: Student[],
  seenNisn: Set<string>,
  seenNis: Set<string>,
  schoolId: string,
): ImportStudentError[] {
  const errors: ImportStudentError[] = [];
  if (!row.name.trim()) errors.push({ rowNumber: row.rowNumber, field: "name", code: "required", message: "Nama siswa wajib diisi." });
  if (!row.nisn?.trim() && !row.nis?.trim()) errors.push({ rowNumber: row.rowNumber, field: "nisn/nis", code: "required", message: "NISN atau NIS wajib diisi." });
  if (!row.method || !["DIGITAL", "MANUAL"].includes(row.method)) errors.push({ rowNumber: row.rowNumber, field: "method", code: "invalid", message: "Metode harus DIGITAL atau MANUAL." });

  if (row.nisn) {
    if (seenNisn.has(row.nisn)) errors.push({ rowNumber: row.rowNumber, field: "nisn", code: "duplicate", message: "NISN duplikat di dalam file." });
    if (existingStudents.some((student) => student.schoolId === schoolId && student.nisn === row.nisn)) errors.push({ rowNumber: row.rowNumber, field: "nisn", code: "duplicate", message: "NISN sudah terdaftar di sekolah ini." });
    seenNisn.add(row.nisn);
  }
  if (row.nis) {
    if (seenNis.has(row.nis)) errors.push({ rowNumber: row.rowNumber, field: "nis", code: "duplicate", message: "NIS duplikat di dalam file." });
    if (existingStudents.some((student) => student.schoolId === schoolId && student.nis === row.nis)) errors.push({ rowNumber: row.rowNumber, field: "nis", code: "duplicate", message: "NIS sudah terdaftar di sekolah ini." });
    seenNis.add(row.nis);
  }
  return errors;
}
