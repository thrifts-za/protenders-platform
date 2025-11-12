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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Download,
  Mail,
  Users,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  Eye,
  TrendingUp,
  TrendingDown,
  Minus,
  Building2,
  Phone,
  Briefcase,
  MessageSquare,
  Calendar,
  User,
  Link as LinkIcon
} from 'lucide-react';
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
  const [selectedEntry, setSelectedEntry] = useState<WaitingListEntry | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <span title="Pending"><Clock className="h-4 w-4 text-blue-500" /></span>;
      case 'contacted':
        return <span title="Contacted"><Mail className="h-4 w-4 text-yellow-500" /></span>;
      case 'converted':
        return <span title="Converted"><CheckCircle className="h-4 w-4 text-green-500" /></span>;
      case 'declined':
        return <span title="Declined"><XCircle className="h-4 w-4 text-red-500" /></span>;
      default:
        return <span title={status}><Minus className="h-4 w-4 text-gray-400" /></span>;
    }
  };

  const getInterestIcon = (interest?: string) => {
    if (!interest) return <span title="Not specified"><Minus className="h-4 w-4 text-gray-400" /></span>;

    switch (interest) {
      case 'high':
        return <span title="High Interest"><TrendingUp className="h-4 w-4 text-green-600" /></span>;
      case 'medium':
        return <span title="Medium Interest"><Minus className="h-4 w-4 text-yellow-600" /></span>;
      case 'low':
        return <span title="Low Interest"><TrendingDown className="h-4 w-4 text-gray-500" /></span>;
      default:
        return <span title={interest}><Minus className="h-4 w-4 text-gray-400" /></span>;
    }
  };

  const openDetails = (entry: WaitingListEntry) => {
    setSelectedEntry(entry);
    setDetailsOpen(true);
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
                    <TableHead className="w-[200px]">Name</TableHead>
                    <TableHead className="w-[200px]">Email</TableHead>
                    <TableHead className="w-[150px]">Company</TableHead>
                    <TableHead className="w-[60px] text-center">Interest</TableHead>
                    <TableHead className="w-[60px] text-center">Status</TableHead>
                    <TableHead className="w-[100px]">Joined</TableHead>
                    <TableHead className="w-[140px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <div className="max-w-[200px]">
                          <p className="font-medium truncate" title={entry.name}>
                            {entry.name}
                          </p>
                          {entry.jobTitle && (
                            <p className="text-xs text-muted-foreground truncate" title={entry.jobTitle}>
                              {entry.jobTitle}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px]">
                          <p className="text-sm truncate" title={entry.email}>
                            {entry.email}
                          </p>
                          {entry.phoneNumber && (
                            <p className="text-xs text-muted-foreground truncate" title={entry.phoneNumber}>
                              {entry.phoneNumber}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[150px]">
                          <p className="text-sm truncate" title={entry.company || '-'}>
                            {entry.company || '-'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {getInterestIcon(entry.interest)}
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusIcon(entry.status)}
                      </TableCell>
                      <TableCell className="text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            {dayjs(entry.createdAt).fromNow()}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDetails(entry)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Select
                            value={entry.status}
                            onValueChange={(value) => updateStatus(entry.id, value)}
                            disabled={updating === entry.id}
                          >
                            <SelectTrigger className="w-[60px] h-8">
                              <SelectValue>
                                {updating === entry.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  getStatusIcon(entry.status)
                                )}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-blue-500" />
                                  Pending
                                </div>
                              </SelectItem>
                              <SelectItem value="contacted">
                                <div className="flex items-center gap-2">
                                  <Mail className="h-4 w-4 text-yellow-500" />
                                  Contacted
                                </div>
                              </SelectItem>
                              <SelectItem value="converted">
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                  Converted
                                </div>
                              </SelectItem>
                              <SelectItem value="declined">
                                <div className="flex items-center gap-2">
                                  <XCircle className="h-4 w-4 text-red-500" />
                                  Declined
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Modal */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Lead Details</DialogTitle>
            <DialogDescription>
              Complete information about this waiting list entry
            </DialogDescription>
          </DialogHeader>

          {selectedEntry && (
            <div className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <User className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Full Name</p>
                      <p className="font-medium">{selectedEntry.name}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <Mail className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Email Address</p>
                      <p className="font-medium break-all">{selectedEntry.email}</p>
                    </div>
                  </div>
                  {selectedEntry.phoneNumber && (
                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <Phone className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Phone Number</p>
                        <p className="font-medium">{selectedEntry.phoneNumber}</p>
                      </div>
                    </div>
                  )}
                  {selectedEntry.jobTitle && (
                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <Briefcase className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Job Title</p>
                        <p className="font-medium">{selectedEntry.jobTitle}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Company Information */}
              {selectedEntry.company && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Company Information
                  </h3>
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <Building2 className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Company Name</p>
                      <p className="font-medium">{selectedEntry.company}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Interest & Message */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Interest & Message
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="mt-0.5">{getInterestIcon(selectedEntry.interest)}</div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Interest Level</p>
                      <p className="font-medium capitalize">{selectedEntry.interest || 'Not specified'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <LinkIcon className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Source</p>
                      <p className="font-medium">{selectedEntry.source}</p>
                    </div>
                  </div>
                </div>
                {selectedEntry.message && (
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <MessageSquare className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-1">Message</p>
                      <p className="text-sm">{selectedEntry.message}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Status & Timeline */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Status & Timeline
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="mt-0.5">{getStatusIcon(selectedEntry.status)}</div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Current Status</p>
                      <p className="font-medium capitalize">{selectedEntry.status}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <Calendar className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Joined</p>
                      <p className="font-medium">{dayjs(selectedEntry.createdAt).format('MMM D, YYYY')}</p>
                      <p className="text-xs text-muted-foreground">
                        {dayjs(selectedEntry.createdAt).fromNow()}
                      </p>
                    </div>
                  </div>
                  {selectedEntry.contactedAt && (
                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <Mail className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Contacted At</p>
                        <p className="font-medium">{dayjs(selectedEntry.contactedAt).format('MMM D, YYYY')}</p>
                        <p className="text-xs text-muted-foreground">
                          {dayjs(selectedEntry.contactedAt).fromNow()}
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedEntry.convertedAt && (
                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Converted At</p>
                        <p className="font-medium">{dayjs(selectedEntry.convertedAt).format('MMM D, YYYY')}</p>
                        <p className="text-xs text-muted-foreground">
                          {dayjs(selectedEntry.convertedAt).fromNow()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* User Account (if exists) */}
              {selectedEntry.user && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Associated User Account
                  </h3>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <p className="text-sm font-semibold text-green-900">User Account Created</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">User ID</p>
                        <p className="font-mono text-xs">{selectedEntry.user.id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Role</p>
                        <Badge variant="outline">{selectedEntry.user.role}</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Section */}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Update Status</p>
                  <Select
                    value={selectedEntry.status}
                    onValueChange={(value) => {
                      updateStatus(selectedEntry.id, value);
                      setDetailsOpen(false);
                    }}
                    disabled={updating === selectedEntry.id}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-500" />
                          Pending
                        </div>
                      </SelectItem>
                      <SelectItem value="contacted">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-yellow-500" />
                          Contacted
                        </div>
                      </SelectItem>
                      <SelectItem value="converted">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Converted
                        </div>
                      </SelectItem>
                      <SelectItem value="declined">
                        <div className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-red-500" />
                          Declined
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
