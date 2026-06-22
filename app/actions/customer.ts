'use server';

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function getCustomers() {
    const session = await auth();
    if (!session?.user?.id) return [];
    const isAdmin = (session.user as any).role === 'ADMIN';

    return await prisma.customer.findMany({
        where: isAdmin ? {} : {
            companies: {
                some: { parentId: session.user.id }
            }
        },
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
        const session = await auth();
        if (!session?.user?.id) throw new Error("Unauthorized");
        const isAdmin = (session.user as any).role === 'ADMIN';

        if (!isAdmin && data.companyIds && data.companyIds.length > 0) {
            const count = await prisma.company.count({
                where: { 
                    id: { in: data.companyIds },
                    parentId: session.user.id
                }
            });
            if (count !== data.companyIds.length) {
                throw new Error("Unauthorized to link to one or more selected companies");
            }
        }

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
        const session = await auth();
        if (!session?.user?.id) throw new Error("Unauthorized");
        const isAdmin = (session.user as any).role === 'ADMIN';

        if (!isAdmin) {
            const existing = await prisma.customer.findFirst({
                where: { 
                    id,
                    companies: { some: { parentId: session.user.id } }
                }
            });
            if (!existing) throw new Error("Unauthorized");
            
            if (data.companyIds && data.companyIds.length > 0) {
                const count = await prisma.company.count({
                    where: { 
                        id: { in: data.companyIds },
                        parentId: session.user.id
                    }
                });
                if (count !== data.companyIds.length) {
                    throw new Error("Unauthorized to link to one or more selected companies");
                }
            }
        }

        await prisma.$transaction(async (tx) => {
            await tx.customer.update({
                where: { id },
                data: {
                    name: data.name,
                    address: data.address,
                    area: data.area,
                    companies: {
                        set: [], // Clear all
                        connect: data.companyIds?.map((cid: string) => ({ id: cid })) || []
                    }
                }
            });

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
        const session = await auth();
        if (!session?.user?.id) throw new Error("Unauthorized");
        const isAdmin = (session.user as any).role === 'ADMIN';

        if (!isAdmin) {
            const existing = await prisma.customer.findFirst({
                where: { 
                    id,
                    companies: { some: { parentId: session.user.id } }
                }
            });
            if (!existing) throw new Error("Unauthorized");
        }

        await prisma.customer.delete({ where: { id } });
        revalidatePath('/config/customer');
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to delete customer." };
    }
}
