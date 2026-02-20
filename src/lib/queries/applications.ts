import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import type { ListApplicationsParams } from "@/lib/validators";

export async function getApplications(params: ListApplicationsParams) {
  const { status, search, sortBy, sortDir, page, limit, dateFrom, dateTo } =
    params;

  const where: Prisma.ApplicationWhereInput = {};

  if (status) {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { companyName: { contains: search } },
      { positionTitle: { contains: search } },
    ];
  }

  if (dateFrom || dateTo) {
    where.applicationDate = {};
    if (dateFrom) where.applicationDate.gte = dateFrom;
    if (dateTo) where.applicationDate.lte = dateTo;
  }

  const [data, total] = await Promise.all([
    db.application.findMany({
      where,
      orderBy: { [sortBy]: sortDir },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.application.count({ where }),
  ]);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getApplicationsForBoard() {
  return db.application.findMany({
    select: {
      id: true,
      companyName: true,
      positionTitle: true,
      status: true,
      platform: true,
      applicationDate: true,
      location: true,
    },
    orderBy: { applicationDate: "desc" },
  });
}

export async function getApplicationById(id: string) {
  return db.application.findUnique({
    where: { id },
    include: {
      statusHistory: { orderBy: { changedAt: "desc" } },
    },
  });
}
