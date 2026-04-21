import { NextResponse } from 'next/server';
import { ComplaintMonitorService } from '../../../../../src/services/monitoring/ComplaintMonitorService';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const results = await ComplaintMonitorService.runMonitoringCheck();

    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('[Cron] Complaint monitor check failed:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
