"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Mail, RefreshCw, Send, Save } from "lucide-react";

type MailLog = {
  id: string;
  to: string;
  subject: string;
  status: string;
  error?: string | null;
  isTest?: boolean;
  createdAt: string;
};

export default function MailPage() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<MailLog[]>([]);
  const [testEmail, setTestEmail] = useState("");

  // Template state
  const [subject, setSubject] = useState("");
  const [headerHtml, setHeaderHtml] = useState("");
  const [footerHtml, setFooterHtml] = useState("");

  useEffect(() => {
    loadLogs();
    // Load template (if previously saved in Config)
    loadTemplate();
  }, []);

  async function loadLogs() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/mail/logs');
      if (res.ok) {
        const json = await res.json();
        setLogs(json.data || []);
      }
    } finally {
      setLoading(false);
    }
  }

  async function loadTemplate() {
    // Template stored under Config key 'mailTemplate'
    // There's no GET endpoint to fetch the template key directly; keep blank by default
  }

  async function sendTest() {
    if (!testEmail) return;
    const res = await fetch('/api/admin/mail/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: testEmail }),
    });
    if (res.ok) {
      setTestEmail("");
      await loadLogs();
      alert('Test email enqueued');
    } else {
      alert('Failed to send test email');
    }
  }

  async function saveTemplate() {
    const res = await fetch('/api/admin/mail/template', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, headerHtml, footerHtml }),
    });
    if (res.ok) {
      alert('Template saved');
    } else {
      alert('Failed to save template');
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Mail Management</h1>
        <p className="text-muted-foreground">Email templates, logs, and testing</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5" /> Email System</CardTitle>
          <CardDescription>Manage email templates and view mail logs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Test Email */}
            <div className="md:col-span-1">
              <h3 className="font-semibold mb-2">Send Test Email</h3>
              <div className="flex gap-2">
                <Input placeholder="recipient@example.com" value={testEmail} onChange={(e) => setTestEmail(e.target.value)} />
                <Button onClick={sendTest}><Send className="h-4 w-4 mr-2" />Send</Button>
              </div>
            </div>

            {/* Template Editor */}
            <div className="md:col-span-2">
              <h3 className="font-semibold mb-2">Template</h3>
              <div className="grid grid-cols-1 gap-3">
                <Input placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
                <Textarea placeholder="Header HTML" value={headerHtml} onChange={(e) => setHeaderHtml(e.target.value)} rows={3} />
                <Textarea placeholder="Footer HTML" value={footerHtml} onChange={(e) => setFooterHtml(e.target.value)} rows={3} />
                <div className="flex gap-2">
                  <Button variant="outline" onClick={saveTemplate}><Save className="h-4 w-4 mr-2" />Save Template</Button>
                  <Button variant="outline" onClick={loadLogs}><RefreshCw className="h-4 w-4 mr-2" />Refresh Logs</Button>
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Logs */}
          <h3 className="font-semibold mb-2">Recent Mail Logs</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left py-2 px-2">Date</th>
                  <th className="text-left py-2 px-2">To</th>
                  <th className="text-left py-2 px-2">Subject</th>
                  <th className="text-left py-2 px-2">Status</th>
                  <th className="text-left py-2 px-2">Error</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">Loading logs...</td></tr>
                ) : logs.length === 0 ? (
                  <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">No logs</td></tr>
                ) : (
                  logs.map((l) => (
                    <tr key={l.id} className="border-b last:border-0">
                      <td className="py-3 px-2 text-xs">{new Date(l.createdAt).toLocaleString()}</td>
                      <td className="py-3 px-2">{l.to}</td>
                      <td className="py-3 px-2">{l.subject}</td>
                      <td className="py-3 px-2">{l.status}{l.isTest ? ' (test)' : ''}</td>
                      <td className="py-3 px-2 text-xs text-muted-foreground">{l.error || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
