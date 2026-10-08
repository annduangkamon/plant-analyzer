const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// รายชื่อโมเดลเรียงตามลำดับความเสถียรและความพร้อมใช้งาน
const MODEL_CANDIDATES = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-1.5-flash",
    "gemini-3.8-flash"
];

// รายชื่อ API Versions ที่รองรับ
const API_VERSIONS = ["v1beta", "v1"];

app.post('/api/analyze', async (req, res) => {
    try {
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

        if (!GEMINI_API_KEY) {
            return res.status(500).json({ 
                error: "ยังไม่ได้ตั้งค่า GEMINI_API_KEY บน Server" 
            });
        }

        let lastError = null;

        // วนลูปสลับทั้ง API Version และ Model
        for (const apiVersion of API_VERSIONS) {
            for (const modelName of MODEL_CANDIDATES) {
                try {
                    const googleApiUrl = `https://generativelanguage.googleapis.com/${apiVersion}/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;
                    
                    const response = await fetch(googleApiUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(req.body)
                    });

                    const data = await response.json();

                    if (response.ok) {
                        console.log(`Successfully used model: ${modelName} via ${apiVersion}`);
                        return res.json(data); // สำเร็จ! ส่งผลลัพธ์กลับทันที
                    }

                    console.warn(`[${apiVersion}] Model ${modelName} failed (${response.status}):`, data.error?.message);
                    lastError = data.error?.message || `HTTP ${response.status}`;

                } catch (err) {
                    console.warn(`[${apiVersion}] Network error with ${modelName}:`, err.message);
                    lastError = err.message;
                }
            }
        }

        // หากทดลองทุกคู่ผสมแล้วยังไม่ผ่าน
        return res.status(500).json({
            error: `ทดลองทุกโมเดลแล้วแต่ไม่สำเร็จ ข้อผิดพลาดล่าสุด: ${lastError}`
        });

    } catch (error) {
        console.error("Server Internal Error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/', (req, res) => {
    res.send('Plant Analyzer API Server is Running with Multi-Version Fallback!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
