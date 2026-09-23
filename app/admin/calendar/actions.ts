"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateReservationStatus(formData: FormData) {
  const reservationId = BigInt(formData.get("reservationId") as string);
  const status = formData.get("status") as string;
  const date = formData.get("date") as string;

  await prisma.reservation.update({
    where: { id: reservationId },
    data: { status: status as "COMPLETED" | "NO_SHOW" | "CANCELLED" },
  });

  revalidatePath("/admin/calendar");
  revalidatePath("/admin/customers");
  return { date };
}