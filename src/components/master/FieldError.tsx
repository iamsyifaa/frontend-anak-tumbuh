import React from "react";

export const FieldError: React.FC<{ message?: string }> = ({ message }) =>
  message ? <p className="mt-1 text-xs font-semibold text-rose-600">{message}</p> : null;
