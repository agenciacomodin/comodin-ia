
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AIDemoService } from '@/lib/ai-demo-service';
import { getUserOrganization } from '@/lib/auth-utils';

// POST /api/ai/demo-usage - Crear usos de IA de demostración
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const organization = await getUserOrganization(session.user.email);
    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    const user = organization.users.find((u: any) => u.email === session.user.email);
    const body = await request.json();
    const { type = 'random', count = 1 } = body;

    let result;

    if (type === 'chat') {
      result = await AIDemoService.simulateChatResponse(
        organization.id, 
        user?.id, 
        user?.name || user?.email
      );
    } else if (type === 'sentiment') {
      result = await AIDemoService.simulateSentimentAnalysis(
        organization.id, 
        user?.id, 
        user?.name || user?.email
      );
    } else if (type === 'content') {
      result = await AIDemoService.simulateContentGeneration(
        organization.id, 
        user?.id, 
        user?.name || user?.email
      );
    } else if (type === 'translation') {
      result = await AIDemoService.simulateTranslation(
        organization.id, 
        user?.id, 
        user?.name || user?.email
      );
    } else if (type === 'summary') {
      result = await AIDemoService.simulateTextSummary(
        organization.id, 
        user?.id, 
        user?.name || user?.email
      );
    } else if (type === 'multiple') {
      result = await AIDemoService.createDemoUsage(
        organization.id,
        user?.id,
        user?.name || user?.email,
        Math.min(count, 10) // Limitar a máximo 10 usos por petición
      );
    } else {
      // Tipo random - crear un uso aleatorio
      result = await AIDemoService.createDemoUsage(
        organization.id,
        user?.id,
        user?.name || user?.email,
        1
      );
      result = result[0];
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: type === 'multiple' ? 
        `${Array.isArray(result) ? result.length : 1} usos de IA procesados exitosamente` :
        'Uso de IA procesado exitosamente'
    });

  } catch (error: any) {
    console.error('Error processing AI usage demo:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/ai/demo-usage - Obtener costos estimados
export async function GET() {
  try {
    const estimatedCosts = AIDemoService.getEstimatedCosts();
    
    return NextResponse.json({
      success: true,
      data: estimatedCosts
    });

  } catch (error) {
    console.error('Error getting estimated costs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
