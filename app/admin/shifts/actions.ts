"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createShift(formData: FormData) {
  const staffId = BigInt(formData.get("staffId") as string);
  const workDate = formData.get("workDate") as string;
  const startTimeStr = formData.get("startTime") as string;
  const endTimeStr = formData.get("endTime") as string;

  const [y, m, d] = workDate.split("-").map(Number);
  const [startHH, startMM] = startTimeStr.split(":").map(Number);
  const [endHH, endMM] = endTimeStr.split(":").map(Number);

  await prisma.shift.create({
    data: {
      staffId,
      workDate: new Date(Date.UTC(y, m - 1, d)),
      startTime: new Date(Date.UTC(1970, 0, 1, startHH, startMM)),
      endTime: new Date(Date.UTC(1970, 0, 1, endHH, endMM)),
    },
  });

  revalidatePath("/admin/shifts");
}

export async function deleteShift(formData: FormData) {
  const shiftId = BigInt(formData.get("shiftId") as string);
  await prisma.shift.delete({ where: { id: shiftId } });
  revalidatePath("/admin/shifts");
}