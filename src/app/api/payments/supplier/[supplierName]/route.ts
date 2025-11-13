/**
 * Supplier Payment History API
 *
 * Get detailed payment history and statistics for a specific supplier
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ supplierName: string }> }
) {
  try {
    const { supplierName } = await params;
    const decodedSupplierName = decodeURIComponent(supplierName);

    const searchParams = request.nextUrl.searchParams;
    const fiscalYear = searchParams.get('fiscalYear') || '2025/26';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '20', 10), 100);
    const skip = (page - 1) * pageSize;

    // Find exact supplier name from normalized name
    const supplierMatch = await prisma.procurementPayment.findFirst({
      where: {
        supplierNameNorm: {
          contains: decodedSupplierName.toLowerCase(),
        },
        fiscalYear,
      },
      select: {
        supplierName: true,
      },
    });

    if (!supplierMatch) {
      return NextResponse.json(
        { error: 'Supplier not found' },
        { status: 404 }
      );
    }

    const exactSupplierName = supplierMatch.supplierName;

    // Get supplier summary statistics
    const summary = await prisma.procurementPayment.aggregate({
      where: {
        supplierName: exactSupplierName,
        fiscalYear,
      },
      _sum: {
        transactionAmount: true,
      },
      _count: true,
      _avg: {
        transactionAmount: true,
      },
      _min: {
        transactionAmount: true,
      },
      _max: {
        transactionAmount: true,
      },
    });

    // Get payment breakdown by province
    const byProvince = await prisma.$queryRaw<Array<{
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
      WHERE "supplierName" = ${exactSupplierName}
        AND "fiscalYear" = ${fiscalYear}
      GROUP BY "province", "provinceCode"
      ORDER BY "totalSpend" DESC
    `;

    // Get payment breakdown by department
    const byDepartment = await prisma.$queryRaw<Array<{
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
      WHERE "supplierName" = ${exactSupplierName}
        AND "fiscalYear" = ${fiscalYear}
      GROUP BY "department", "departmentCode"
      ORDER BY "totalSpend" DESC
      LIMIT 10
    `;

    // Get payment breakdown by category
    const byCategory = await prisma.$queryRaw<Array<{
      unspscFamily: string;
      totalSpend: Prisma.Decimal;
      transactionCount: bigint;
    }>>`
      SELECT
        "unspscFamily",
        SUM("transactionAmount") as "totalSpend",
        COUNT(*)::bigint as "transactionCount"
      FROM "procurement_payments"
      WHERE "supplierName" = ${exactSupplierName}
        AND "fiscalYear" = ${fiscalYear}
      GROUP BY "unspscFamily"
      ORDER BY "totalSpend" DESC
      LIMIT 10
    `;

    // Get recent transactions (paginated)
    const [transactions, totalTransactions] = await Promise.all([
      prisma.procurementPayment.findMany({
        where: {
          supplierName: exactSupplierName,
          fiscalYear,
        },
        skip,
        take: pageSize,
        orderBy: {
          transactionAmount: 'desc',
        },
        select: {
          id: true,
          province: true,
          provinceCode: true,
          department: true,
          unspscFamily: true,
          classTitle: true,
          transactionAmount: true,
          createdAt: true,
        },
      }),
      prisma.procurementPayment.count({
        where: {
          supplierName: exactSupplierName,
          fiscalYear,
        },
      }),
    ]);

    // Convert Decimal to number
    const convertToNumber = (data: any[]) => {
      return data.map(item => ({
        ...item,
        totalSpend: item.totalSpend ? parseFloat(item.totalSpend.toString()) : 0,
        transactionCount: item.transactionCount ? Number(item.transactionCount) : 0,
      }));
    };

    return NextResponse.json({
      supplier: {
        name: exactSupplierName,
        fiscalYear,
      },
      summary: {
        totalPayments: summary._sum.transactionAmount?.toNumber() || 0,
        transactionCount: summary._count || 0,
        averagePayment: summary._avg.transactionAmount?.toNumber() || 0,
        minPayment: summary._min.transactionAmount?.toNumber() || 0,
        maxPayment: summary._max.transactionAmount?.toNumber() || 0,
      },
      breakdown: {
        byProvince: convertToNumber(byProvince),
        byDepartment: convertToNumber(byDepartment),
        byCategory: convertToNumber(byCategory),
      },
      recentTransactions: transactions.map(t => ({
        ...t,
        transactionAmount: t.transactionAmount.toNumber(),
      })),
      pagination: {
        page,
        pageSize,
        total: totalTransactions,
        pages: Math.ceil(totalTransactions / pageSize),
      },
    });
  } catch (error) {
    console.error('Error fetching supplier payment history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch supplier data' },
      { status: 500 }
    );
  }
}
