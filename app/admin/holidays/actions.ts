"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createHoliday(formData: FormData) {
  const holidayDate = formData.get("holidayDate") as string;
  const description = (formData.get("description") as string) || null;

  const [y, m, d] = holidayDate.split("-").map(Number);

  await prisma.shopHoliday.create({
    data: {
      holidayDate: new Date(Date.UTC(y, m - 1, d)),
      description,
    },
  });

  revalidatePath("/admin/holidays");
}

export async function deleteHoliday(formData: FormData) {
  const id = BigInt(formData.get("id") as string);
  await prisma.shopHoliday.delete({ where: { id } });
  revalidatePath("/admin/holidays");
}