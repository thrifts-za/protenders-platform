"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Shield,
  User,
  Eye,
  Mail,
  Calendar,
  Clock,
  UserCog,
  LogIn,
  RefreshCw,
  Users as UsersIcon
} from "lucide-react";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

type UserRow = {
  id: string;
  email: string;
  name?: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string | null;
};

export default function AdminUsersPage() {
  const [rows, setRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [role, setRole] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => { load(); }, [q, role, page, pageSize]);

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (role !== 'all') params.set('role', role);
    params.set('page', String(page));
    params.set('pageSize', String(pageSize));
    const res = await fetch(`/api/admin/users?${params.toString()}`, { cache: 'no-store' });
    const json = await res.json();
    setRows(json.data || []);
    setTotal(json.pagination?.total || 0);
    setTotalPages(json.pagination?.totalPages || 1);
    setLoading(false);
  }

  const getRoleIcon = (role: string) => {
    switch (role.toUpperCase()) {
      case 'ADMIN':
        return <span title="Admin"><Shield className="h-4 w-4 text-red-500" /></span>;
      case 'USER':
        return <span title="User"><User className="h-4 w-4 text-blue-500" /></span>;
      case 'VIEWER':
        return <span title="Viewer"><Eye className="h-4 w-4 text-gray-500" /></span>;
      default:
        return <span title={role}><UserCog className="h-4 w-4 text-gray-400" /></span>;
    }
  };

  const openDetails = (user: UserRow) => {
    setSelectedUser(user);
    setDetailsOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Users</h1>
          <p className="text-muted-foreground">Registered users of the platform</p>
        </div>
        <Button variant="outline" onClick={load}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Total Users</p>
          </div>
          <p className="text-2xl font-bold">{total.toLocaleString()}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>User Directory</CardTitle>
          <CardDescription>Search and filter users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <Input
              placeholder="Search name or email..."
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
            />
            <Select value={role} onValueChange={(v) => { setRole(v); setPage(1); }}>
              <SelectTrigger><SelectValue placeholder="Role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="ADMIN">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-red-500" />
                    Admin
                  </div>
                </SelectItem>
                <SelectItem value="USER">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-500" />
                    User
                  </div>
                </SelectItem>
                <SelectItem value="VIEWER">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-gray-500" />
                    Viewer
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(parseInt(v)); setPage(1); }}>
              <SelectTrigger><SelectValue placeholder="Page size" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Email</TableHead>
                  <TableHead className="w-[200px]">Name</TableHead>
                  <TableHead className="w-[60px] text-center">Role</TableHead>
                  <TableHead className="w-[120px]">Created</TableHead>
                  <TableHead className="w-[120px]">Last Login</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                      Loading users…
                    </TableCell>
                  </TableRow>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="max-w-[250px]">
                          <p className="text-sm truncate" title={u.email}>
                            {u.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px]">
                          <p className="text-sm truncate" title={u.name || '-'}>
                            {u.name || '-'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {getRoleIcon(u.role)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {dayjs(u.createdAt).fromNow()}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {u.lastLoginAt ? dayjs(u.lastLoginAt).fromNow() : '-'}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDetails(u)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between mt-4 text-sm">
            <div>Page {page} of {totalPages} · {total.toLocaleString()} users</div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                Prev
              </Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details Modal */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Complete information about this user account
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6">
              {/* Account Information */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Account Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <Mail className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Email Address</p>
                      <p className="font-medium break-all">{selectedUser.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <User className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Name</p>
                      <p className="font-medium">{selectedUser.name || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="mt-0.5">{getRoleIcon(selectedUser.role)}</div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Role</p>
                      <Badge variant={selectedUser.role === 'ADMIN' ? 'destructive' : 'secondary'}>
                        {selectedUser.role}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <Calendar className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">User ID</p>
                      <p className="font-mono text-xs">{selectedUser.id}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity Information */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Activity
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <Calendar className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Account Created</p>
                      <p className="font-medium">{dayjs(selectedUser.createdAt).format('MMM D, YYYY')}</p>
                      <p className="text-xs text-muted-foreground">
                        {dayjs(selectedUser.createdAt).fromNow()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <Clock className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Last Updated</p>
                      <p className="font-medium">{dayjs(selectedUser.updatedAt).format('MMM D, YYYY')}</p>
                      <p className="text-xs text-muted-foreground">
                        {dayjs(selectedUser.updatedAt).fromNow()}
                      </p>
                    </div>
                  </div>
                  {selectedUser.lastLoginAt && (
                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <LogIn className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Last Login</p>
                        <p className="font-medium">{dayjs(selectedUser.lastLoginAt).format('MMM D, YYYY')}</p>
                        <p className="text-xs text-muted-foreground">
                          {dayjs(selectedUser.lastLoginAt).fromNow()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
