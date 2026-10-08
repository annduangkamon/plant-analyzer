const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 10000;

// อนุญาตให้หน้าเว็บเรียกใช้งาน API ได้โดยไม่ติด CORS
app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.post('/api/analyze', async (req, res) => {
    try {
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

        if (!GEMINI_API_KEY) {
            return res.status(500).json({ 
                error: "ยังไม่ได้ตั้งค่า GEMINI_API_KEY บน Server" 
            });
        }

        // ปรับเปลี่ยนโมเดลเป็น gemini-2.0-flash
        const googleApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

        const response = await fetch(googleApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(req.body)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Google API Error:", data);
            return res.status(response.status).json({ 
                error: data.error?.message || "เกิดข้อผิดพลาดในการเรียก Google API" 
            });
        }

        res.json(data);

    } catch (error) {
        console.error("Server Internal Error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/', (req, res) => {
    res.send('Plant Analyzer API Server is Running!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
