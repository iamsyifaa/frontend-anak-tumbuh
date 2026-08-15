import React from "react";
import { StudentMethod, StudentStatus } from "../../types/student";

export const StudentStatusBadge: React.FC<{ method: StudentMethod }> = ({ method }) => (
  <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black ${method === "DIGITAL" ? "bg-sky-100 text-sky-700" : "bg-amber-100 text-amber-700"}`}>
    {method}
  </span>
);

export const AccountStatusBadge: React.FC<{ status: StudentStatus }> = ({ status }) => {
  const label = status === "active" ? "Aktif" : status === "pending" ? "Pending" : status === "inactive" ? "Nonaktif" : status === "transferred" ? "Pindah" : "Lulus";
  return <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-600">{label}</span>;
};
