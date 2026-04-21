'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '../../../components/layout/AppShell';
import { StatCard } from '../../../components/ui/StatCard';
import { Badge } from '../../../components/ui/Badge';
import { getGradeColor, scoreToGrade, CRSDetail } from '@/packages/shared/src/types/crs';
import { supabase } from '../../../src/lib/supabase/client';
import { getCurrentAccount } from '../../../src/lib/supabase/client';

export default function CRSDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [clients, setClients] = useState<CRSDetail[]>([]);
  const [avgScore, setAvgScore] = useState(0);
  const [highRiskCount, setHighRiskCount] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        const account = await getCurrentAccount();
        if (!account) {
          setIsLoading(false);
          return;
        }

        const { data: crsData } = await supabase
          .from('crs_scores')
          .select(`
            contact_id,
            score,
            last_updated,
            contact:contacts(id, name, email)
          `)
          .eq('account_id', account.id);

        if (crsData) {
          const enriched: CRSDetail[] = crsData.map((crs: any) => ({
            contact_id: crs.contact_id,
            contact_name: crs.contact?.name || 'Unknown',
            contact_email: crs.contact?.email || '',
            crs_score: crs.score,
            grade: scoreToGrade(crs.score),
            total_invoices: 0,
            paid_invoices: 0,
            overdue_invoices: 0,
            total_outstanding_cents: 0,
            promises_made: 0,
            promises_kept: 0,
            promises_broken: 0,
            avg_days_late: 0,
            last_updated: crs.last_updated,
          }));

          setClients(enriched);

          const avg = enriched.reduce((sum, c) => sum + c.crs_score, 0) / enriched.length;
          setAvgScore(Math.round(avg));

          const highRisk = enriched.filter(c => c.crs_score < 60).length;
          setHighRiskCount(highRisk);
        }
      } catch (err) {
        console.error('Error fetching CRS data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'var(--success)';
    if (score >= 60) return 'var(--warning)';
    return 'var(--danger)';
  };

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <div className="spin w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-8 page-enter">
        {/* Header */}
        <div>
          <h1 className="text-h1">Client Reliability Score</h1>
          <p className="text-body mt-2" style={{ color: 'var(--text-secondary)' }}>
            Track payment behavior and reliability across your client base
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            label="Average CRS"
            value={`${avgScore}/100`}
            delta={avgScore >= 70 ? 'Healthy' : 'Needs attention'}
            deltaType={avgScore >= 70 ? 'positive' : 'negative'}
          />
          <StatCard
            label="Total Clients"
            value={clients.length.toString()}
          />
          <StatCard
            label="High Risk Clients"
            value={highRiskCount.toString()}
            delta={highRiskCount > 0 ? 'Requires monitoring' : 'All clear'}
            deltaType={highRiskCount > 0 ? 'negative' : 'positive'}
          />
        </div>

        {/* Client List */}
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          {clients.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-body" style={{ color: 'var(--text-muted)' }}>
                No CRS data available yet. Import invoices to start tracking client reliability.
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <th className="px-6 py-4 text-left text-label" style={{ color: 'var(--text-secondary)' }}>
                    Client
                  </th>
                  <th className="px-6 py-4 text-left text-label" style={{ color: 'var(--text-secondary)' }}>
                    CRS Score
                  </th>
                  <th className="px-6 py-4 text-left text-label" style={{ color: 'var(--text-secondary)' }}>
                    Grade
                  </th>
                  <th className="px-6 py-4 text-left text-label" style={{ color: 'var(--text-secondary)' }}>
                    Last Updated
                  </th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr
                    key={client.contact_id}
                    className="transition-all duration-200"
                    style={{ borderBottom: '1px solid var(--border-subtle)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--bg-highlight)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-body font-medium" style={{ color: 'var(--text-primary)' }}>
                          {client.contact_name}
                        </div>
                        <div className="text-small" style={{ color: 'var(--text-secondary)' }}>
                          {client.contact_email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-mono-lg" style={{ color: getScoreColor(client.crs_score) }}>
                        {client.crs_score}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge status={client.crs_score >= 80 ? 'paid' : client.crs_score >= 60 ? 'pending' : 'overdue'}>
                        {client.grade}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-small" style={{ color: 'var(--text-secondary)' }}>
                      {new Date(client.last_updated).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AppShell>
  );
}
