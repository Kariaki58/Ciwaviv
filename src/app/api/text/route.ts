import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "../../../../config/database";

export async function GET(req: NextRequest) {
    try {
        await connectToDatabase();
        return NextResponse.json({ message: "success" })
    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: "failed" })
    }
}