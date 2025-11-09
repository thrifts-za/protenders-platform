'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Mail, Users, CheckCircle, Clock, XCircle, Loader2 } from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface WaitingListEntry {
  id: string;
  name: string;
  email: string;
  company?: string;
  phoneNumber?: string;
  jobTitle?: string;
  interest?: string;
  message?: string;
  status: string;
  source: string;
  createdAt: string;
  contactedAt?: string;
  convertedAt?: string;
  user?: {
    id: string;
    name?: string;
    email: string;
    role: string;
  };
}

interface Stats {
  total: number;
  pending: number;
  contacted: number;
  converted: number;
  declined: number;
}

export default function WaitingListAdminPage() {
  const [entries, setEntries] = useState<WaitingListEntry[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    contacted: 0,
    converted: 0,
    declined: 0,
  });
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadEntries();
  }, [filter]);

  const loadEntries = async () => {
    setLoading(true);
    try {
      const url = filter === 'all'
        ? '/api/waiting-list'
        : `/api/waiting-list?status=${filter}`;

      const res = await fetch(url);
      const data = await res.json();

      setEntries(data.entries || []);
      setStats(data.stats || {});
    } catch (error) {
      console.error('Failed to load entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    try {
      const res = await fetch(`/api/waiting-list/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        loadEntries();
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setUpdating(null);
    }
  };

  const exportToCSV = () => {
    const csvData = [
      ['Name', 'Email', 'Company', 'Phone', 'Job Title', 'Interest', 'Status', 'Source', 'Created Date'],
      ...entries.map(entry => [
        entry.name,
        entry.email,
        entry.company || '',
        entry.phoneNumber || '',
        entry.jobTitle || '',
        entry.interest || '',
        entry.status,
        entry.source,
        dayjs(entry.createdAt).format('YYYY-MM-DD HH:mm'),
      ]),
    ];

    const csv = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `waiting-list-${dayjs().format('YYYY-MM-DD')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="default">Pending</Badge>;
      case 'contacted':
        return <Badge variant="secondary">Contacted</Badge>;
      case 'converted':
        return <Badge className="bg-green-500">Converted</Badge>;
      case 'declined':
        return <Badge variant="outline">Declined</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getInterestBadge = (interest?: string) => {
    if (!interest) return null;

    switch (interest) {
      case 'high':
        return <Badge variant="default">High Interest</Badge>;
      case 'medium':
        return <Badge variant="secondary">Medium Interest</Badge>;
      case 'low':
        return <Badge variant="outline">Low Interest</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Waiting List</h1>
          <p className="text-muted-foreground">
            Manage premium access waiting list entries
          </p>
        </div>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Total Entries</p>
            </div>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-blue-500" />
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
            <p className="text-2xl font-bold text-blue-600">{stats.pending}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Mail className="h-4 w-4 text-yellow-500" />
              <p className="text-sm text-muted-foreground">Contacted</p>
            </div>
            <p className="text-2xl font-bold text-yellow-600">{stats.contacted}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <p className="text-sm text-muted-foreground">Converted</p>
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.converted}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <XCircle className="h-4 w-4 text-red-500" />
              <p className="text-sm text-muted-foreground">Declined</p>
            </div>
            <p className="text-2xl font-bold text-red-600">{stats.declined}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
          <TabsTrigger value="contacted">Contacted ({stats.contacted})</TabsTrigger>
          <TabsTrigger value="converted">Converted ({stats.converted})</TabsTrigger>
          <TabsTrigger value="declined">Declined ({stats.declined})</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Entries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Waiting List Entries</CardTitle>
          <CardDescription>
            View and manage all waiting list submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No entries found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Interest</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{entry.name}</p>
                          {entry.jobTitle && (
                            <p className="text-xs text-muted-foreground">{entry.jobTitle}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{entry.email}</p>
                          {entry.phoneNumber && (
                            <p className="text-xs text-muted-foreground">{entry.phoneNumber}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{entry.company || '-'}</TableCell>
                      <TableCell>{getInterestBadge(entry.interest)}</TableCell>
                      <TableCell>{getStatusBadge(entry.status)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {entry.source}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div>
                          <p>{dayjs(entry.createdAt).format('MMM D, YYYY')}</p>
                          <p className="text-xs text-muted-foreground">
                            {dayjs(entry.createdAt).fromNow()}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={entry.status}
                          onValueChange={(value) => updateStatus(entry.id, value)}
                          disabled={updating === entry.id}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="contacted">Contacted</SelectItem>
                            <SelectItem value="converted">Converted</SelectItem>
                            <SelectItem value="declined">Declined</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
