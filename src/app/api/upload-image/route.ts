import { NextRequest, NextResponse } from "next/server";
import { UploadFile } from "@/lib/cloudinary/cloud-fun";
import connectToDatabase from "../../../../config/database";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { User } from "../../../../models/user";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: "You are not logged in" }, { status: 401 });
        }
        const userId = session?.user?.id;


        if (!userId) {
            return NextResponse.json({ error: "Invalid User" }, { status: 401 });
        }

        await connectToDatabase();

        const user = await User.findById(userId);

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        if (user.role !== "admin") {
            return NextResponse.json({ error: "You are not authorized" }, { status: 403 });
        }

        const formData = await req.formData();
        const files = formData.getAll("files").filter((entry): entry is File => entry instanceof File);

        if (!files || files.length === 0) {
            return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
        }

        const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
        const maxFileSize = 10 * 1024 * 1024; // 10MB

        const errors: string[] = [];

        for (const file of files) {
            if (!allowedTypes.includes(file.type)) {
                errors.push(`File type not allowed: ${file.type}`);
            }

            if (file.size > maxFileSize) {
                errors.push(`File ${file.name} is too large (max 10MB).`);
            }
        }

        if (errors.length > 0) {
            return NextResponse.json({ errors }, { status: 400 });
        }

        const uploadedUrls: string[] = [];

        for (const file of files) {
            const secure_url = await UploadFile(file);
            uploadedUrls.push(secure_url);
        }

        return NextResponse.json({ 
            success: true, 
            urls: uploadedUrls 
        });

    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Error occurred during upload" }, { status: 500 });
    }
}