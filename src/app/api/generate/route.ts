
const API_KEY = process.env.GEMINI_API_KEY; 

export async function POST(req: Request) {
  // Verifique se a API Key está configurada (importante em TypeScript para evitar 'undefined')
  if (!API_KEY) {
    return new Response(JSON.stringify({ error: 'API Key do Gemini não configurada no servidor.' }), { status: 500 });
  }

  
  const { prompt } = await req.json();

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

  try {
    const chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
    const payload = { contents: chatHistory };

   
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('Erro na API Gemini:', response.status, errorData);
        return new Response(JSON.stringify({ error: 'Erro ao gerar o exemplo.' }), { status: response.status });
    }

    const result = await response.json();

    
    return new Response(JSON.stringify(result.candidates[0].content.parts[0]), { status: 200 });

  } catch (error) {
    console.error('Erro ao chamar a API:', error);
    return new Response(JSON.stringify({ error: 'Erro interno do servidor.' }), { status: 500 });
  }
}