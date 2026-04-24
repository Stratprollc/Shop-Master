import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for background WhatsApp sending
  app.post('/api/whatsapp/send', async (req, res) => {
    const { method, apiUrl, token, instanceId, phoneNumberId, phone, message } = req.body;

    try {
      let finalResponse;
      
      if (method === 'metacloud') {
        // Official Meta Cloud API (Free 1000/mo)
        const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
        finalResponse = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: phone,
            type: "text",
            text: { body: message }
          })
        });
      } else {
        // Generic / Paid Gateway
        let body: any = {};
        if (apiUrl?.includes('ultramsg')) {
          body = { token, to: phone, body: message };
        } else {
          body = { instance: instanceId, token, to: phone, message };
        }

        finalResponse = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
      }

      const data = await finalResponse.json();
      res.json({ success: finalResponse.ok, data });
    } catch (error) {
      console.error('Server-side WhatsApp send error:', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
