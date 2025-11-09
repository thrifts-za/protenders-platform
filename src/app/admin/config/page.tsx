"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Settings, Save, RefreshCw } from "lucide-react";

type AdminConfig = {
  platform: { name: string; version: string; environment: string };
  features: { alerts: boolean; savedSearches: boolean; tenderPacks: boolean; aiIntelligence: boolean; analytics: boolean };
  notificationBar: { message: string; enabled: boolean };
  sync: { enabled: boolean; autoSync: boolean; syncInterval: string; maxPagesPerDay: number; maxScrapeDetails: number };
  limits: { maxAlertsPerUser: number; maxSavedTendersPerUser: number; maxSearchResultsPerPage: number };
  api: { rateLimit: number; rateLimitWindow: string; maxRequestSize: string };
};

export default function ConfigPage() {
  const [loading, setLoading] = useState(true);
  const [cfg, setCfg] = useState<AdminConfig | null>(null);

  useEffect(() => { loadConfig(); }, []);

  async function loadConfig() {
    setLoading(true);
    const res = await fetch('/api/admin/config');
    if (res.ok) {
      const json = await res.json();
      setCfg(json.config as AdminConfig);
    }
    setLoading(false);
  }

  async function saveConfig() {
    if (!cfg) return;
    const res = await fetch('/api/admin/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cfg),
    });
    if (res.ok) {
      alert('Configuration updated (in-memory)');
      loadConfig();
    } else {
      alert('Failed to update configuration');
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">System Configuration</h1>
        <p className="text-muted-foreground">Manage system settings and feature toggles</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5" /> Configuration</CardTitle>
          <CardDescription>System settings and feature flags</CardDescription>
        </CardHeader>
        <CardContent>
          {loading || !cfg ? (
            <div className="text-center py-12 text-muted-foreground">
              <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Loading configuration...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Platform */}
              <div>
                <h3 className="font-semibold mb-2">Platform</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input value={cfg.platform.name} onChange={(e) => setCfg({ ...cfg, platform: { ...cfg.platform, name: e.target.value } })} />
                  <Input value={cfg.platform.version} onChange={(e) => setCfg({ ...cfg, platform: { ...cfg.platform, version: e.target.value } })} />
                  <Input value={cfg.platform.environment} onChange={(e) => setCfg({ ...cfg, platform: { ...cfg.platform, environment: e.target.value } })} />
                </div>
              </div>

              <Separator />

              {/* Notification Bar */}
              <div>
                <h3 className="font-semibold mb-2">Notification Bar</h3>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Message displayed at the top of the site</label>
                  <Input
                    value={cfg.notificationBar.message}
                    onChange={(e) => setCfg({ ...cfg, notificationBar: { ...cfg.notificationBar, message: e.target.value } })}
                    placeholder="🚀 Beta Version - Best viewed on desktop for optimal experience"
                  />
                </div>
              </div>

              <Separator />

              {/* Limits */}
              <div>
                <h3 className="font-semibold mb-2">Limits</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input type="number" value={cfg.limits.maxAlertsPerUser}
                         onChange={(e) => setCfg({ ...cfg, limits: { ...cfg.limits, maxAlertsPerUser: Number(e.target.value) } })} />
                  <Input type="number" value={cfg.limits.maxSavedTendersPerUser}
                         onChange={(e) => setCfg({ ...cfg, limits: { ...cfg.limits, maxSavedTendersPerUser: Number(e.target.value) } })} />
                  <Input type="number" value={cfg.limits.maxSearchResultsPerPage}
                         onChange={(e) => setCfg({ ...cfg, limits: { ...cfg.limits, maxSearchResultsPerPage: Number(e.target.value) } })} />
                </div>
              </div>

              <Separator />

              {/* API */}
              <div>
                <h3 className="font-semibold mb-2">API</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input type="number" value={cfg.api.rateLimit} onChange={(e) => setCfg({ ...cfg, api: { ...cfg.api, rateLimit: Number(e.target.value) } })} />
                  <Input value={cfg.api.rateLimitWindow} onChange={(e) => setCfg({ ...cfg, api: { ...cfg.api, rateLimitWindow: e.target.value } })} />
                  <Input value={cfg.api.maxRequestSize} onChange={(e) => setCfg({ ...cfg, api: { ...cfg.api, maxRequestSize: e.target.value } })} />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={saveConfig}><Save className="h-4 w-4 mr-2" />Save</Button>
                <Button variant="outline" onClick={loadConfig}><RefreshCw className="h-4 w-4 mr-2" />Reload</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
