import { NextResponse } from "next/server";
import type { ApiResponse } from "@/types";

export function successResponse<T>(data: T, message?: string, status = 200) {
  const body: ApiResponse<T> = { success: true, data, message };
  return NextResponse.json(body, { status });
}

export function errorResponse(error: string, status = 400, data?: Record<string, unknown>) {
  const body: ApiResponse = { success: false, error, ...(data ? { data } : {}) };
  return NextResponse.json(body, { status });
}

export function paginatedResponse<T>(
  data: T,
  meta: { total: number; page: number; limit: number }
) {
  const body: ApiResponse<T> = {
    success: true,
    data,
    meta: { ...meta, totalPages: Math.ceil(meta.total / meta.limit) },
  };
  return NextResponse.json(body);
}
