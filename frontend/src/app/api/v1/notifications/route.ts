import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const notifications = [
    {
      id: 1,
      title: "Statutory APH 2025-26 Extension Notice",
      message: "Scrutiny submission window for technical institutions is active. Verification models updated.",
      created_at: new Date().toISOString(),
      is_read: false,
    },
    {
      id: 2,
      title: "Tamper Anomaly Flagged — ZEC Leh",
      message: "Automated OCR integrity cross-check detected altered intake schedule for Zaskar Engineering College.",
      created_at: new Date(Date.now() - 3600000).toISOString(),
      is_read: false,
    },
  ];

  return NextResponse.json(notifications);
}
