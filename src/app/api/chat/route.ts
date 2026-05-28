import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const SYSTEM_PROMPT = `Eres "Meji", el asistente turístico oficial de Mejía Travel — la app del Cantón Mejía en Pichincha, Ecuador.

CONTEXTO DEL CANTÓN MEJÍA:
- Capital: Machachi. Parroquias: Aloasí, Alóag, Cutuglagua, El Chaupi, Manuel Cornejo Astorga, Tambillo, Uyumbicho.
- Atractivos famosos: Volcán Cotopaxi (5897m), Pasochoa, El Corazón, Rumiñahui, Aguas Termales La Calera y Tesalia, Parque Nacional Cotopaxi.
- Cultura: Paseo Procesional del Chagra (julio), Fiestas de Cantonización.
- Gastronomía: hornado, yaguarlocro, fritada, locro de papas, humitas, morocho.
- Ubicación: 35 km al sur de Quito, a 2920 m de altitud.

REGLAS:
1. Responde SIEMPRE en español, breve y cálido (máximo 4 párrafos).
2. Si te preguntan dónde comer/dormir/visitar, sugiere lugares reales del cantón cuando los conozcas.
3. Si te preguntan algo NO relacionado con Mejía, Ecuador o turismo, redirige amablemente.
4. Si no sabes algo específico, sé honesto y sugiere consultar el GAD Municipal o explorar las categorías de la app.
5. Usa emojis ocasionalmente para calidez (🏔 🍽 🚌) pero sin abusar.
6. Recomienda secciones de la app cuando sea útil: "Explora la sección Turismo", "Mira la categoría Gastronomía", etc.`;

export async function POST(req: NextRequest) {
  try {
    const { messages, context } = await req.json();

    if (!Array.isArray(messages)) {
      return NextResponse.json({ error: 'messages debe ser un array' }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GROQ_API_KEY no configurada en el servidor' },
        { status: 500 }
      );
    }

    // Construir el system prompt con contexto opcional
    const systemContent = context
      ? `${SYSTEM_PROMPT}\n\nCONTEXTO ADICIONAL DE LA APP:\n${context}`
      : SYSTEM_PROMPT;

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemContent },
          ...messages.slice(-10), // últimas 10 para no saturar contexto
        ],
        temperature: 0.7,
        max_tokens: 600,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: 'Groq API error: ' + err }, { status: res.status });
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content ?? 'No pude generar una respuesta.';

    return NextResponse.json({ reply });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Error desconocido' }, { status: 500 });
  }
}
