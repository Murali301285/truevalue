'use server';

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { hash, compare } from "bcryptjs";
import { auth } from "@/auth";
import fs from "fs/promises";
import path from "path";

async function requireAdmin() {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
        throw new Error("Unauthorized: Admin access required.");
    }
}

export async function getUsers() {
    await requireAdmin();
    return await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
            image: true
        }
    });
}

export async function createUser(data: any) {
    try {
        await requireAdmin();
        const hashedPassword = await hash(data.password, 12);

        await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: hashedPassword,
                role: data.role,
                isActive: data.isActive
            }
        });
        revalidatePath('/config/user');
        return { success: true };
    } catch (error: any) {
        if (error.code === 'P2002') {
            return { success: false, error: "Email already exists." };
        }
        return { success: false, error: "Failed to create user." };
    }
}

export async function updateUser(id: string, data: any) {
    try {
        await requireAdmin();
        // If password provided, hash it. Else ignore.
        const updateData: any = {
            name: data.name,
            email: data.email,
            role: data.role,
            isActive: data.isActive
        };

        if (data.password && data.password.trim() !== "") {
            updateData.password = await hash(data.password, 12);
        }

        await prisma.user.update({
            where: { id },
            data: updateData
        });
        revalidatePath('/config/user');
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to update user." };
    }
}

export async function toggleUserStatus(id: string, currentStatus: boolean) {
    try {
        await requireAdmin();
        await prisma.user.update({
            where: { id },
            data: { isActive: !currentStatus }
        });
        revalidatePath('/config/user');
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to toggle status." };
    }
}

export async function deleteUser(id: string) {
    try {
        await requireAdmin();
        // Prevent deleting self check should technically be here or client side
        // For now, allow delete (with caution in UI)
        await prisma.user.delete({ where: { id } });
        revalidatePath('/config/user');
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to delete user." };
    }
}

export async function getUserProfile(id: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) throw new Error("Unauthorized");
        const isAdmin = (session.user as any).role === 'ADMIN';
        if (!isAdmin && session.user.id !== id) throw new Error("Unauthorized");

        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true,
                businessName: true,
                mobileNumber: true,
                termsAccepted: true,
                dpdpAccepted: true,
                dpdpAcceptedAt: true
            }
        });
        if (user) return { success: true, data: user };
        return { success: false, error: "User not found" };
    } catch (err) {
        return { success: false, error: "Failed to fetch user" };
    }
}

export async function updateUserProfile(id: string, data: any) {
    try {
        const session = await auth();
        if (!session?.user?.id) throw new Error("Unauthorized");
        const isAdmin = (session.user as any).role === 'ADMIN';
        if (!isAdmin && session.user.id !== id) throw new Error("Unauthorized");

        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) return { success: false, error: "User not found" };

        const updateData: any = {};

        // 1. Password Change
        if (data.newPassword && data.newPassword.trim() !== "") {
            // Verify old password
            if (!data.oldPassword) return { success: false, error: "Old password required to set new password." };

            const isValid = await compare(data.oldPassword, user.password || "");
            if (!isValid) return { success: false, error: "Incorrect old password." };

            updateData.password = await hash(data.newPassword, 12);
        }

        // 2. Image Update
        if (data.image !== undefined) {
            if (data.image && data.image.startsWith("data:image")) {
                const matches = data.image.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
                if (matches && matches.length === 3) {
                    const ext = matches[1];
                    const base64Data = matches[2];
                    const buffer = Buffer.from(base64Data, "base64");
                    const fileName = `profile-${id}-${Date.now()}.${ext}`;
                    const uploadDir = path.join(process.cwd(), "public", "uploads", "profiles");
                    await fs.mkdir(uploadDir, { recursive: true });
                    const filePath = path.join(uploadDir, fileName);
                    await fs.writeFile(filePath, buffer);
                    updateData.image = `/uploads/profiles/${fileName}`;
                } else {
                    updateData.image = data.image;
                }
            } else {
                updateData.image = data.image; // Expecting base64 string or URL
            }
        }

        // 3. Profile Setup Update
        if (data.name !== undefined) updateData.name = data.name;
        if (data.businessName !== undefined) updateData.businessName = data.businessName;
        if (data.mobileNumber !== undefined) updateData.mobileNumber = data.mobileNumber;
        if (data.termsAccepted !== undefined) updateData.termsAccepted = data.termsAccepted;
        if (data.dpdpAccepted !== undefined) {
            updateData.dpdpAccepted = data.dpdpAccepted;
            if (data.dpdpAccepted && !user.dpdpAccepted) {
                updateData.dpdpAcceptedAt = new Date();
            }
        }

        await prisma.user.update({
            where: { id },
            data: updateData
        });

        revalidatePath('/dashboard');
        revalidatePath('/profile');
        return { success: true, imageUrl: updateData.image };

    } catch (error) {
        console.error("Profile Update Error:", error);
        return { success: false, error: "Failed to update profile." };
    }
}
