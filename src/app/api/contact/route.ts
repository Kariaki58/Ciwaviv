import { NextResponse } from "next/server";
import { sendContactFormEmail } from "@/lib/email/sendEmail";


export async function POST(req: Request) {
  const body = await req.json();

  const { name, email, message } = body;

  await sendContactFormEmail({ name, email, message });

  return NextResponse.json({ success: true });
}
