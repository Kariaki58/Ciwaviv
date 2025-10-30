import { NextAuthOptions, User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { User } from "../../models/user";
import bcrypt from "bcryptjs";
import connectToDatabase from "../../config/database";

type Credentials = {
    email: string;
    password: string;
};

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role: string;
            name: string;
            username: string;
            email: string;
            image: string;
        };
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        username: string;
        role: string;
    }
}

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "your-email@example.com" },
                password: { label: "Password", type: "password", placeholder: "Your password" },
            },
            async authorize(credentials: Partial<Credentials> | undefined) {
                if (!credentials?.email || !credentials.password) {
                    throw new Error("Missing email or password");
                }

                try {
                    await connectToDatabase();

                    const user = await User.findOne({ email: credentials.email.toLowerCase() }).exec();

                    if (!user) {
                        throw new Error("No user found with this email");
                    }

                    const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

                    if (!isPasswordValid) {
                        throw new Error("Invalid password");
                    }

                    // Check if user is verified (if required by your app)
                    if (!user.isVerified) {
                        throw new Error("Please verify your email before logging in");
                    }

                    return {
                        id: user._id.toString(),
                        name: user.name || user.email.split('@')[0],
                        email: user.email,
                        role: user.role,
                    };
                } catch (error) {
                    console.error("Authorization error:", error);
                    throw error;
                }
            },
        }),
    ],
    pages: {
        signIn: "/auth/login",
    },
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (trigger === "update" && session?.user) {
                token.role = session.user.role;
            }
            else if (user) {
                const customUser = user as { id: string; role: string; username: string };
                token.role = customUser.role;
                token.username = customUser.username;
                token.id = customUser.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session?.user) {
                session.user.role = token.role;
                session.user.username = token.username;
                session.user.id = token.id;
            }
            return session;
        },
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    secret: process.env.NEXTAUTH_SECRET,
};