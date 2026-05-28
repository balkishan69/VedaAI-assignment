import axios from "axios";
import type { ApiResponse, Assignment } from "./types";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api",
  withCredentials: true
});

export interface AssignmentList {
  items: Assignment[];
  total: number;
  page: number;
  pages: number;
}

export async function createAssignment(formData: FormData) {
  const { data } = await api.post<ApiResponse<Assignment>>("/assignments", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return data.data;
}

export async function fetchAssignments() {
  const { data } = await api.get<ApiResponse<AssignmentList>>("/assignments");
  return data.data;
}

export async function fetchAssignment(id: string) {
  const { data } = await api.get<ApiResponse<Assignment>>(`/assignments/${id}`);
  return data.data;
}

export async function regenerateAssignment(id: string) {
  const { data } = await api.post<ApiResponse<Assignment>>(`/assignments/${id}/regenerate`);
  return data.data;
}

export async function requestPdf(id: string) {
  const { data } = await api.post<ApiResponse<Assignment>>(`/assignments/${id}/pdf`);
  return data.data;
}

export function pdfUrl(id: string) {
  return `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api"}/assignments/${id}/pdf`;
}
