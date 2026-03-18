'use server';

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { hash } from "bcryptjs";

export async function getUsers() {
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
        // Prevent deleting self check should technically be here or client side
        // For now, allow delete (with caution in UI)
        await prisma.user.delete({ where: { id } });
        revalidatePath('/config/user');
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to delete user." };
    }
}

import { compare } from "bcryptjs";

export async function getUserProfile(id: string) {
    try {
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
            updateData.image = data.image; // Expecting base64 string or URL
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
        return { success: true };

    } catch (error) {
        console.error("Profile Update Error:", error);
        return { success: false, error: "Failed to update profile." };
    }
}
