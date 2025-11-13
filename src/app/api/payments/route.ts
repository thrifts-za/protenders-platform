/**
 * Procurement Payments API
 *
 * Query BAS/CSD payment transaction data for analytics and supplier intelligence
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Pagination
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '20', 10), 100);
    const skip = (page - 1) * pageSize;

    // Filters
    const supplierName = searchParams.get('supplier');
    const province = searchParams.get('province');
    const provinceCode = searchParams.get('provinceCode');
    const department = searchParams.get('department');
    const fiscalYear = searchParams.get('fiscalYear') || '2025/26';
    const unspscFamily = searchParams.get('category');
    const minAmount = searchParams.get('minAmount');
    const maxAmount = searchParams.get('maxAmount');

    // Build where clause
    const where: any = {
      fiscalYear,
    };

    if (supplierName) {
      where.supplierNameNorm = {
        contains: supplierName.toLowerCase(),
      };
    }

    if (province) {
      where.province = {
        contains: province,
        mode: 'insensitive',
      };
    }

    if (provinceCode) {
      where.provinceCode = provinceCode;
    }

    if (department) {
      where.department = {
        contains: department,
        mode: 'insensitive',
      };
    }

    if (unspscFamily) {
      where.unspscFamily = {
        contains: unspscFamily,
        mode: 'insensitive',
      };
    }

    if (minAmount || maxAmount) {
      where.transactionAmount = {};
      if (minAmount) where.transactionAmount.gte = parseFloat(minAmount);
      if (maxAmount) where.transactionAmount.lte = parseFloat(maxAmount);
    }

    // Execute query with pagination
    const [payments, total] = await Promise.all([
      prisma.procurementPayment.findMany({
        where,
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
          supplierName: true,
          unspscFamily: true,
          classTitle: true,
          transactionAmount: true,
          fiscalYear: true,
          createdAt: true,
        },
      }),
      prisma.procurementPayment.count({ where }),
    ]);

    return NextResponse.json({
      payments: payments.map(p => ({
        ...p,
        transactionAmount: p.transactionAmount.toNumber(),
      })),
      pagination: {
        page,
        pageSize,
        total,
        pages: Math.ceil(total / pageSize),
      },
      filters: {
        supplierName,
        province,
        provinceCode,
        department,
        fiscalYear,
        category: unspscFamily,
        minAmount,
        maxAmount,
      },
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment data' },
      { status: 500 }
    );
  }
}
