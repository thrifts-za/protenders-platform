'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp,
  Building2,
  MapPin,
  Package,
  DollarSign,
  Users,
  FileText,
  Activity
} from 'lucide-react';

interface AnalyticsData {
  summary: {
    totalSpending: number;
    transactionCount: number;
    averageTransaction: number;
    fiscalYear: string;
  };
  topSuppliers: Array<{
    supplierName: string;
    totalSpend: number;
    transactionCount: number;
  }>;
  spendingByProvince: Array<{
    province: string;
    provinceCode: string;
    totalSpend: number;
    transactionCount: number;
  }>;
  spendingByCategory: Array<{
    unspscFamily: string;
    totalSpend: number;
    transactionCount: number;
  }>;
  topDepartments: Array<{
    department: string;
    departmentCode: string;
    totalSpend: number;
    transactionCount: number;
  }>;
}

export default function PaymentAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/payments/analytics?fiscalYear=2025/26')
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setData(data);
        }
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load analytics data');
        setLoading(false);
      });
  }, []);

  const formatCurrency = (amount: number) => {
    if (amount >= 1e9) {
      return `R ${(amount / 1e9).toFixed(2)}B`;
    } else if (amount >= 1e6) {
      return `R ${(amount / 1e6).toFixed(2)}M`;
    } else if (amount >= 1e3) {
      return `R ${(amount / 1e3).toFixed(2)}K`;
    }
    return `R ${amount.toFixed(2)}`;
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-ZA').format(num);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-4 bg-muted rounded w-20"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-32 mb-2"></div>
                <div className="h-3 bg-muted rounded w-24"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <p className="text-sm text-destructive">{error || 'Failed to load data'}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spending</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.summary.totalSpending)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              FY {data.summary.fiscalYear}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.summary.transactionCount)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Payment records
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Transaction</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.summary.averageTransaction)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Per payment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Suppliers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.topSuppliers.length)}+</div>
            <p className="text-xs text-muted-foreground mt-1">
              Top suppliers shown
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="suppliers" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="suppliers">Top Suppliers</TabsTrigger>
          <TabsTrigger value="provinces">By Province</TabsTrigger>
          <TabsTrigger value="categories">By Category</TabsTrigger>
        </TabsList>

        <TabsContent value="suppliers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Top 10 Suppliers by Spending
              </CardTitle>
              <CardDescription>
                Suppliers with highest total payments received in FY {data.summary.fiscalYear}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.topSuppliers.map((supplier, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono text-xs">
                          #{index + 1}
                        </Badge>
                        <p className="font-medium text-sm">{supplier.supplierName}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatNumber(supplier.transactionCount)} transactions
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">{formatCurrency(supplier.totalSpend)}</p>
                      <p className="text-xs text-muted-foreground">
                        {((supplier.totalSpend / data.summary.totalSpending) * 100).toFixed(2)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Top 10 Departments by Spending
              </CardTitle>
              <CardDescription>
                Government departments with highest procurement spending
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.topDepartments.map((dept, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono text-xs">
                          #{index + 1}
                        </Badge>
                        <p className="font-medium text-sm">{dept.department}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatNumber(dept.transactionCount)} transactions
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">{formatCurrency(dept.totalSpend)}</p>
                      <p className="text-xs text-muted-foreground">
                        {((dept.totalSpend / data.summary.totalSpending) * 100).toFixed(2)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="provinces" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Spending by Province
              </CardTitle>
              <CardDescription>
                Procurement spending across all South African provinces
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.spendingByProvince.map((province, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge className="font-mono text-xs">
                          {province.provinceCode}
                        </Badge>
                        <p className="font-medium text-sm">{province.province}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatNumber(province.transactionCount)} transactions
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">{formatCurrency(province.totalSpend)}</p>
                      <p className="text-xs text-muted-foreground">
                        {((province.totalSpend / data.summary.totalSpending) * 100).toFixed(2)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Top 15 Spending Categories
              </CardTitle>
              <CardDescription>
                Procurement by UNSPSC (Universal Standard Products and Services Code) category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.spendingByCategory.map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono text-xs">
                          #{index + 1}
                        </Badge>
                        <p className="font-medium text-sm">{category.unspscFamily}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatNumber(category.transactionCount)} transactions
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">{formatCurrency(category.totalSpend)}</p>
                      <p className="text-xs text-muted-foreground">
                        {((category.totalSpend / data.summary.totalSpending) * 100).toFixed(2)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
