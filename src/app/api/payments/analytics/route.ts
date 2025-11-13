/**
 * Procurement Payments Analytics API
 *
 * Aggregated statistics and insights from payment data
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const fiscalYear = searchParams.get('fiscalYear') || '2025/26';
    const province = searchParams.get('province');
    const department = searchParams.get('department');

    // Build base where clause
    const baseWhere: any = { fiscalYear };
    if (province) baseWhere.province = { contains: province, mode: 'insensitive' };
    if (department) baseWhere.department = { contains: department, mode: 'insensitive' };

    // Total spending
    const totalSpending = await prisma.procurementPayment.aggregate({
      where: baseWhere,
      _sum: {
        transactionAmount: true,
      },
      _count: true,
      _avg: {
        transactionAmount: true,
      },
    });

    // Top 10 suppliers by total spend
    const topSuppliers = await prisma.$queryRaw<Array<{
      supplierName: string;
      totalSpend: Prisma.Decimal;
      transactionCount: bigint;
    }>>`
      SELECT
        "supplierName",
        SUM("transactionAmount") as "totalSpend",
        COUNT(*)::bigint as "transactionCount"
      FROM "procurement_payments"
      WHERE "fiscalYear" = ${fiscalYear}
        ${province ? Prisma.sql`AND "province" ILIKE ${'%' + province + '%'}` : Prisma.empty}
        ${department ? Prisma.sql`AND "department" ILIKE ${'%' + department + '%'}` : Prisma.empty}
      GROUP BY "supplierName"
      ORDER BY "totalSpend" DESC
      LIMIT 10
    `;

    // Spending by province
    const spendingByProvince = await prisma.$queryRaw<Array<{
      province: string;
      provinceCode: string;
      totalSpend: Prisma.Decimal;
      transactionCount: bigint;
    }>>`
      SELECT
        "province",
        "provinceCode",
        SUM("transactionAmount") as "totalSpend",
        COUNT(*)::bigint as "transactionCount"
      FROM "procurement_payments"
      WHERE "fiscalYear" = ${fiscalYear}
        ${department ? Prisma.sql`AND "department" ILIKE ${'%' + department + '%'}` : Prisma.empty}
      GROUP BY "province", "provinceCode"
      ORDER BY "totalSpend" DESC
    `;

    // Spending by category (UNSPSC Family)
    const spendingByCategory = await prisma.$queryRaw<Array<{
      unspscFamily: string;
      totalSpend: Prisma.Decimal;
      transactionCount: bigint;
    }>>`
      SELECT
        "unspscFamily",
        SUM("transactionAmount") as "totalSpend",
        COUNT(*)::bigint as "transactionCount"
      FROM "procurement_payments"
      WHERE "fiscalYear" = ${fiscalYear}
        ${province ? Prisma.sql`AND "province" ILIKE ${'%' + province + '%'}` : Prisma.empty}
        ${department ? Prisma.sql`AND "department" ILIKE ${'%' + department + '%'}` : Prisma.empty}
      GROUP BY "unspscFamily"
      ORDER BY "totalSpend" DESC
      LIMIT 15
    `;

    // Top departments by spending
    const topDepartments = await prisma.$queryRaw<Array<{
      department: string;
      departmentCode: string;
      totalSpend: Prisma.Decimal;
      transactionCount: bigint;
    }>>`
      SELECT
        "department",
        "departmentCode",
        SUM("transactionAmount") as "totalSpend",
        COUNT(*)::bigint as "transactionCount"
      FROM "procurement_payments"
      WHERE "fiscalYear" = ${fiscalYear}
        ${province ? Prisma.sql`AND "province" ILIKE ${'%' + province + '%'}` : Prisma.empty}
      GROUP BY "department", "departmentCode"
      ORDER BY "totalSpend" DESC
      LIMIT 10
    `;

    // Convert Decimal to number for JSON serialization
    const convertToNumber = (data: any[]) => {
      return data.map(item => ({
        ...item,
        totalSpend: item.totalSpend ? parseFloat(item.totalSpend.toString()) : 0,
        transactionCount: item.transactionCount ? Number(item.transactionCount) : 0,
      }));
    };

    return NextResponse.json({
      summary: {
        totalSpending: totalSpending._sum.transactionAmount?.toNumber() || 0,
        transactionCount: totalSpending._count || 0,
        averageTransaction: totalSpending._avg.transactionAmount?.toNumber() || 0,
        fiscalYear,
      },
      topSuppliers: convertToNumber(topSuppliers),
      spendingByProvince: convertToNumber(spendingByProvince),
      spendingByCategory: convertToNumber(spendingByCategory),
      topDepartments: convertToNumber(topDepartments),
      filters: {
        fiscalYear,
        province,
        department,
      },
    });
  } catch (error) {
    console.error('Error fetching payment analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}
