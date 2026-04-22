'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '../../../components/layout/AppShell';
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
    if (score >= 80) return 'var(--brand-secondary)';
    if (score >= 60) return 'var(--brand-accent)';
    return 'var(--brand-danger)';
  };

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <div className="spin w-8 h-8 border-2 border-[var(--brand-primary)] border-t-transparent rounded-full" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6 page-enter">
        {/* Stats */}
        <div className="stat-grid">
          <div className="glass-card stat-card">
            <div className="stat-card__label">
              Average CRS
              <span style={{ fontSize: '1rem' }}>📈</span>
            </div>
            <div className="stat-card__value">{avgScore}/100</div>
            <span className={`stat-card__change ${avgScore >= 70 ? 'stat-card__change--up' : 'stat-card__change--down'}`}>
              {avgScore >= 70 ? 'Healthy' : 'Needs attention'}
            </span>
          </div>
          <div className="glass-card stat-card">
            <div className="stat-card__label">
              Total Clients
              <span style={{ fontSize: '1rem' }}>👥</span>
            </div>
            <div className="stat-card__value">{clients.length}</div>
            <span className="stat-card__change stat-card__change--up">Tracking actively</span>
          </div>
          <div className="glass-card stat-card">
            <div className="stat-card__label">
              High Risk Clients
              <span style={{ fontSize: '1rem' }}>⚠️</span>
            </div>
            <div className="stat-card__value" style={{ color: highRiskCount > 0 ? 'var(--brand-danger)' : 'var(--text-primary)' }}>
              {highRiskCount}
            </div>
            <span className={`stat-card__change ${highRiskCount > 0 ? 'stat-card__change--down' : 'stat-card__change--up'}`}>
              {highRiskCount > 0 ? 'Requires monitoring' : 'All clear'}
            </span>
          </div>
        </div>

        {/* Client List */}
        <div className="glass-card data-card">
          <div className="data-card__header">
            <div className="data-card__title">Client Reliability Scores</div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>CRS Score</th>
                  <th>Grade</th>
                  <th>Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {clients.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-12 text-secondary">
                      No CRS data available yet. Import invoices to start tracking client reliability.
                    </td>
                  </tr>
                ) : (
                  clients.map((client) => (
                    <tr key={client.contact_id} className="cursor-pointer">
                      <td>
                        <div className="text-body font-medium">{client.contact_name}</div>
                        <div className="text-small text-secondary">{client.contact_email}</div>
                      </td>
                      <td>
                        <span className="text-mono font-bold text-lg" style={{ color: getScoreColor(client.crs_score) }}>
                          {client.crs_score}
                        </span>
                      </td>
                      <td>
                        <Badge status={client.crs_score >= 80 ? 'paid' : client.crs_score >= 60 ? 'pending' : 'overdue'}>
                          {client.grade}
                        </Badge>
                      </td>
                      <td className="text-secondary text-small">
                        {new Date(client.last_updated).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
