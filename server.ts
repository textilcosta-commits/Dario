import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Inicialización segura y perezosa de Gemini
let genAIClient: GoogleGenAI | null = null;
function getGenAI() {
  if (!genAIClient && process.env.GEMINI_API_KEY) {
    try {
      genAIClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (err) {
      console.warn("No se pudo inicializar GoogleGenAI:", err);
    }
  }
  return genAIClient;
}

// API Health
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Costa Textil API',
    hasGeminiKey: !!process.env.GEMINI_API_KEY
  });
});

// Endpoint de Asistente Textil / Búsqueda Semántica con Gemini
app.post('/api/ai/assistant', async (req, res) => {
  const { prompt, catalogSummary, currentArticle } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt es requerido' });
  }

  const ai = getGenAI();

  // Si Gemini no está configurado o falla, proveer respuesta de respaldo basada en conocimiento textil
  if (!ai) {
    return res.json({
      reply: `Como asistente de Costa Textil, puedo orientarte sobre las telas de nuestro catálogo. Para camisas de verano frescas te recomendamos el Lino Italiano (Art. 18.204) o la Batista Giza (Art. 11.410). Para camisería ejecutiva formal, el Algodón Pima Peruano (Art. 17.154) y el Twill (Art. 15.930). Si necesitás confirmar metrajes exactos o cortes muestra, podés contactarnos directamente por WhatsApp al 11 3840-1234 o visitarnos en Alsina 1170.`,
      suggestedFilters: {
        category: prompt.toLowerCase().includes('sastrer') ? 'Sastrería' : 'Camisería',
        keywords: prompt.split(' ').filter(w => w.length > 3)
      },
      isAiPowered: false
    });
  }

  try {
    const systemInstruction = `Sos el Asistente Textil especializado de "Costa Textil", una histórica y prestigiosa casa textil argentina ubicada en Adolfo Alsina 1170 (Monserrat, CABA), especializada en la venta mayorista y minorista de telas para camisería y sastrería de alta gama.

REGLAS ESTRICTAS DE RESPUESTA:
1. Basate ÚNICAMENTE en la información real provista del catálogo de Costa Textil.
2. NUNCA inventes artículos, códigos inexistentes, disponibilidad falsa ni precios.
3. Si un artículo consultado está agotado o dado de baja, recomendá explícitamente sus reemplazos disponibles.
4. Tu tono debe ser experto, profesional, cálido, sartorial y cercano.
5. Recordá siempre que vendemos tanto cortes a medida (minorista) como piezas para talleres y marcas (mayorista).
6. Cuando no tengas certeza absoluta o falte información de stock, finalizá diciendo: "Te recomiendo consultar directamente con el equipo de Costa Textil por WhatsApp o en nuestro showroom de Alsina 1170".

Catálogo actual disponible resumido:
${catalogSummary || 'Art. 17.154 Algodón Pima Peruano (Disponible), Art. 12.035 Poplín Suizo (Agotado - reemplazo en Twill 15.930), Art. 18.204 Lino Italiano Lavado (Disponible), Art. 14.882 Oxford Royal Británico (Poco stock), Art. 11.410 Batista Egipcia Giza (Disponible), Art. 15.930 Twill Italiano (Disponible), Art. 13.722 Jacquard (Dado de baja), Art. 19.305 Seersucker (Disponible), Art. 16.420 Confort Stretch (Poco stock), Art. 21.050 Lana Fría Super 130s (Disponible), Art. 22.180 Gabardina Británica (Disponible)'}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.3,
        maxOutputTokens: 600,
      }
    });

    const reply = response.text || 'Te recomendamos consultar con el equipo de Costa Textil.';
    res.json({ reply, isAiPowered: true });
  } catch (error: any) {
    console.error('Error llamando a Gemini API:', error);
    res.json({
      reply: `En Costa Textil disponemos de una cuidada selección de telas para tu proyecto (Algodón Pima Peruano, Lino Italiano, Poplín y Lana Fría). Te invitamos a explorar las secciones del catálogo o escribirnos por WhatsApp al 11 3840-1234 para asesoramiento personalizado.`,
      isAiPowered: false
    });
  }
});

// Configuración de Vite o archivos estáticos
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Costa Textil Server ejecutándose en http://0.0.0.0:${PORT}`);
  });
}

startServer();
