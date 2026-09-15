import { prisma } from "@/lib/prisma";

type CreateReservationInput = {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  menuId: bigint;
  staffId: bigint;
  startTime: Date;
  endTime: Date;
  isNominated: boolean;
  source: "WEB" | "PHONE" | "STORE";
  createdByUserId?: bigint;
};

export class ReservationConflictError extends Error {}

export async function createReservationCore(input: CreateReservationInput) {
  const customer = await prisma.customer.upsert({
    where: { phone: input.customerPhone },
    update: { name: input.customerName, email: input.customerEmail },
    create: {
      name: input.customerName,
      phone: input.customerPhone,
      email: input.customerEmail,
    },
  });

  return prisma.$transaction(async (tx) => {
    const conflict = await tx.reservation.findFirst({
      where: {
        staffId: input.staffId,
        status: "CONFIRMED",
        startTime: { lt: input.endTime },
        endTime: { gt: input.startTime },
      },
    });

    if (conflict) {
      throw new ReservationConflictError(
        "この時間帯はすでに他の予約が入っています。"
      );
    }

    return tx.reservation.create({
      data: {
        customerId: customer.id,
        staffId: input.staffId,
        menuId: input.menuId,
        startTime: input.startTime,
        endTime: input.endTime,
        status: "CONFIRMED",
        source: input.source,
        isNominated: input.isNominated,
        createdByUserId: input.createdByUserId,
      },
    });
  });
}