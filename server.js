const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// รายชื่อโมเดลรุ่นใหม่ที่ใช้งานได้ในปัจจุบัน (เรียงตามลำดับความเสถียร)
const MODEL_CANDIDATES = [
    "gemini-2.5-flash",
    "gemini-2.5-pro",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-3.8-flash"
];

app.post('/api/analyze', async (req, res) => {
    try {
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

        if (!GEMINI_API_KEY) {
            return res.status(500).json({ 
                error: "ยังไม่ได้ตั้งค่า GEMINI_API_KEY บน Server" 
            });
        }

        let lastError = null;

        // วนลูปทดลองทีละโมเดล
        for (const modelName of MODEL_CANDIDATES) {
            try {
                const googleApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;
                
                const response = await fetch(googleApiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(req.body)
                });

                const data = await response.json();

                if (response.ok) {
                    console.log(`Successfully used model: ${modelName}`);
                    return res.json(data); // สำเร็จ! ส่งผลลัพธ์กลับทันที
                }

                console.warn(`Model ${modelName} failed (${response.status}):`, data.error?.message);
                lastError = data.error?.message || `HTTP ${response.status}`;

            } catch (err) {
                console.warn(`Network/Fetch error with ${modelName}:`, err.message);
                lastError = err.message;
            }
        }

        // หากทดลองทุกโมเดลแล้วยังไม่ผ่าน
        return res.status(500).json({
            error: `ทดลองทุกโมเดลแล้วแต่ไม่สำเร็จ ข้อผิดพลาดล่าสุด: ${lastError}`
        });

    } catch (error) {
        console.error("Server Internal Error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/', (req, res) => {
    res.send('Plant Analyzer API Server is Running with Auto-Fallback!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
