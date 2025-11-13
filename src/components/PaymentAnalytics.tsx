'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp,
  Building2,
  MapPin,
  Package,
  DollarSign,
  Users,
  FileText,
  Activity,
  ChevronLeft,
  ChevronRight
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
  const [suppliersPage, setSuppliersPage] = useState(0);
  const [departmentsPage, setDepartmentsPage] = useState(0);
  const [provincesPage, setProvincesPage] = useState(0);
  const [categoriesPage, setCategoriesPage] = useState(0);

  const ITEMS_PER_PAGE = 5;

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

  const getTopColor = (index: number) => {
    if (index === 0) return 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800';
    if (index === 1) return 'bg-slate-50 dark:bg-slate-950/20 border-slate-200 dark:border-slate-800';
    if (index === 2) return 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800';
    return 'bg-card border';
  };

  const getTopBadgeColor = (index: number) => {
    if (index === 0) return 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700';
    if (index === 1) return 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700';
    if (index === 2) return 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700';
    return '';
  };

  const getPaginatedItems = <T,>(items: T[], page: number): T[] => {
    const start = page * ITEMS_PER_PAGE;
    return items.slice(start, start + ITEMS_PER_PAGE);
  };

  const getTotalPages = (items: any[]) => Math.ceil(items.length / ITEMS_PER_PAGE);

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
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Top Suppliers by Spending
                  </CardTitle>
                  <CardDescription>
                    Suppliers with highest total payments received in FY {data.summary.fiscalYear}
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="font-mono">
                  {data.topSuppliers.length} total
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getPaginatedItems(data.topSuppliers, suppliersPage).map((supplier, pageIndex) => {
                  const globalIndex = suppliersPage * ITEMS_PER_PAGE + pageIndex;
                  return (
                    <div
                      key={globalIndex}
                      className={`flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors ${getTopColor(globalIndex)}`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`font-mono text-xs ${getTopBadgeColor(globalIndex)}`}>
                            #{globalIndex + 1}
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
                  );
                })}
              </div>
              {getTotalPages(data.topSuppliers) > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    Page {suppliersPage + 1} of {getTotalPages(data.topSuppliers)}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSuppliersPage(p => Math.max(0, p - 1))}
                      disabled={suppliersPage === 0}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSuppliersPage(p => Math.min(getTotalPages(data.topSuppliers) - 1, p + 1))}
                      disabled={suppliersPage >= getTotalPages(data.topSuppliers) - 1}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Top Departments by Spending
                  </CardTitle>
                  <CardDescription>
                    Government departments with highest procurement spending
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="font-mono">
                  {data.topDepartments.length} total
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getPaginatedItems(data.topDepartments, departmentsPage).map((dept, pageIndex) => {
                  const globalIndex = departmentsPage * ITEMS_PER_PAGE + pageIndex;
                  return (
                    <div
                      key={globalIndex}
                      className={`flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors ${getTopColor(globalIndex)}`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`font-mono text-xs ${getTopBadgeColor(globalIndex)}`}>
                            #{globalIndex + 1}
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
                  );
                })}
              </div>
              {getTotalPages(data.topDepartments) > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    Page {departmentsPage + 1} of {getTotalPages(data.topDepartments)}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDepartmentsPage(p => Math.max(0, p - 1))}
                      disabled={departmentsPage === 0}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDepartmentsPage(p => Math.min(getTotalPages(data.topDepartments) - 1, p + 1))}
                      disabled={departmentsPage >= getTotalPages(data.topDepartments) - 1}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="provinces" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Spending by Province
                  </CardTitle>
                  <CardDescription>
                    Procurement spending across all South African provinces
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="font-mono">
                  {data.spendingByProvince.length} provinces
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getPaginatedItems(data.spendingByProvince, provincesPage).map((province, pageIndex) => {
                  const globalIndex = provincesPage * ITEMS_PER_PAGE + pageIndex;
                  return (
                    <div
                      key={globalIndex}
                      className={`flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors ${getTopColor(globalIndex)}`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge className={`font-mono text-xs ${getTopBadgeColor(globalIndex) || 'bg-primary/10'}`}>
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
                  );
                })}
              </div>
              {getTotalPages(data.spendingByProvince) > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    Page {provincesPage + 1} of {getTotalPages(data.spendingByProvince)}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setProvincesPage(p => Math.max(0, p - 1))}
                      disabled={provincesPage === 0}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setProvincesPage(p => Math.min(getTotalPages(data.spendingByProvince) - 1, p + 1))}
                      disabled={provincesPage >= getTotalPages(data.spendingByProvince) - 1}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Top Spending Categories
                  </CardTitle>
                  <CardDescription>
                    Procurement by UNSPSC (Universal Standard Products and Services Code) category
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="font-mono">
                  {data.spendingByCategory.length} categories
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getPaginatedItems(data.spendingByCategory, categoriesPage).map((category, pageIndex) => {
                  const globalIndex = categoriesPage * ITEMS_PER_PAGE + pageIndex;
                  return (
                    <div
                      key={globalIndex}
                      className={`flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors ${getTopColor(globalIndex)}`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`font-mono text-xs ${getTopBadgeColor(globalIndex)}`}>
                            #{globalIndex + 1}
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
                  );
                })}
              </div>
              {getTotalPages(data.spendingByCategory) > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    Page {categoriesPage + 1} of {getTotalPages(data.spendingByCategory)}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCategoriesPage(p => Math.max(0, p - 1))}
                      disabled={categoriesPage === 0}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCategoriesPage(p => Math.min(getTotalPages(data.spendingByCategory) - 1, p + 1))}
                      disabled={categoriesPage >= getTotalPages(data.spendingByCategory) - 1}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
