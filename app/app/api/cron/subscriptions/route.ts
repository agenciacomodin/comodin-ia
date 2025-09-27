
import { NextRequest, NextResponse } from 'next/server';
import { SubscriptionCronService } from '@/lib/subscription-cron';

// POST /api/cron/subscriptions - Ejecutar mantenimiento de suscripciones
export async function POST(request: NextRequest) {
  try {
    // Verificar que la solicitud venga de un cron job autorizado
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const task = searchParams.get('task') || 'all';

    let result;

    switch (task) {
      case 'expired':
        result = await SubscriptionCronService.processExpiredSubscriptions();
        break;
      
      case 'cancel-at-period-end':
        result = await SubscriptionCronService.processCancelAtPeriodEnd();
        break;
      
      case 'reset-usage':
        result = await SubscriptionCronService.resetMonthlyUsage();
        break;
      
      case 'renewal-reminders':
        result = await SubscriptionCronService.processRenewalReminders();
        break;
      
      case 'failed-payments':
        result = await SubscriptionCronService.processFailedPayments();
        break;
      
      case 'report':
        result = await SubscriptionCronService.generateSubscriptionReport();
        break;
      
      case 'all':
      default:
        result = await SubscriptionCronService.runAllMaintenanceTasks();
        break;
    }

    return NextResponse.json({
      success: true,
      task,
      timestamp: new Date().toISOString(),
      result
    });

  } catch (error) {
    console.error('Subscription cron job error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    );
  }
}

// GET /api/cron/subscriptions - Obtener reporte de estado
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const report = await SubscriptionCronService.generateSubscriptionReport();
    
    return NextResponse.json(report);
  } catch (error) {
    console.error('Error generating subscription report:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}
