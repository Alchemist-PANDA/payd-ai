import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    console.log('[Cron] Running broken promise detection...');

    const { stdout, stderr } = await execAsync('tsx scripts/run-broken-promise-detection.ts');

    if (stderr) {
      console.error('[Cron] Broken promise detection stderr:', stderr);
    }

    return NextResponse.json({
      success: true,
      output: stdout,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('[Cron] Broken promise detection failed:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
