'use server';

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getCustomers() {
    return await prisma.customer.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            contacts: true,
            companies: {
                select: { id: true, name: true }
            }
        }
    });
}

export async function createCustomer(data: any) {
    try {
        await prisma.customer.create({
            data: {
                name: data.name,
                address: data.address,
                area: data.area,
                companies: {
                    connect: data.companyIds?.map((id: string) => ({ id })) || []
                },
                contacts: {
                    create: data.contacts?.map((c: any) => ({
                        name: c.name,
                        phone: c.phone,
                        email: c.email,
                        designation: c.designation
                    })) || []
                }
            }
        });
        revalidatePath('/config/customer');
        return { success: true };
    } catch (error) {
        console.error("Create Customer Error:", error);
        return { success: false, error: "Failed to create customer." };
    }
}

export async function updateCustomer(id: string, data: any) {
    try {
        // Transaction to handle complex updates
        await prisma.$transaction(async (tx) => {
            // 1. Update basic info
            await tx.customer.update({
                where: { id },
                data: {
                    name: data.name,
                    address: data.address,
                    area: data.area,
                }
            });

            // 2. Update Companies (Set logic: replace all relations)
            // Implicit many-to-many update is easiest by set
            await tx.customer.update({
                where: { id },
                data: {
                    companies: {
                        set: [], // Clear all
                        connect: data.companyIds?.map((cid: string) => ({ id: cid })) || []
                    }
                }
            });

            // 3. Update Contacts
            // Strategy: Delete all existing and re-create (simplest for prototyping)
            // A more optimized approach would be diffing, but for < 5 contacts, this is fine.
            await tx.customerContact.deleteMany({
                where: { customerId: id }
            });

            if (data.contacts && data.contacts.length > 0) {
                await tx.customerContact.createMany({
                    data: data.contacts.map((c: any) => ({
                        customerId: id,
                        name: c.name,
                        phone: c.phone,
                        email: c.email,
                        designation: c.designation
                    }))
                });
            }
        });

        revalidatePath('/config/customer');
        return { success: true };
    } catch (error) {
        console.error("Update Customer Error:", error);
        return { success: false, error: "Failed to update customer." };
    }
}

export async function deleteCustomer(id: string) {
    try {
        await prisma.customer.delete({ where: { id } });
        revalidatePath('/config/customer');
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to delete customer." };
    }
}
