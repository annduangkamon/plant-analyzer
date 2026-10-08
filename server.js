const express = require('express');
const cors = require('cors');

const app = express();

// อนุญาตให้เรียกใช้ API ได้จากทุกโดเมน (หรือระบุโดเมนเว็บของคุณเพื่อเพิ่มความปลอดภัย)
app.use(cors());

// รองรับการรับข้อมูลรูปภาพ Base64 ขนาดใหญ่สูงสุด 10MB
app.use(express.json({ limit: '10mb' }));

// ดึง API Key จาก Environment Variable ของระบบโฮสติ้ง
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.post('/api/analyze', async (req, res) => {
    try {
        if (!GEMINI_API_KEY) {
            return res.status(500).json({ error: "ยังไม่ได้ตั้งค่า GEMINI_API_KEY บน Server" });
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });

        const data = await response.json();
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "เกิดข้อผิดพลาดภายใน Server: " + err.message });
    }
});

// Endpoint สำหรับเช็กว่า Server ทำงานปกติหรือไม่
app.get('/', (req, res) => {
    res.send("Plant Analyzer API Server is Running!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));