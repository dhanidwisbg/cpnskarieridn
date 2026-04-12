const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 8080;

app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, '..')));

app.post('/submit', (req, res) => {
    const { text } = req.body;
    console.log(`Received OCR results (${text.length} chars)`);
    fs.appendFileSync(path.join(__dirname, 'kemenkes_ocr.txt'), text + '\n');
    res.json({ status: 'ok' });
});

app.listen(port, () => {
    console.log(`OCR Server running at http://localhost:${port}`);
    console.log(`Open http://localhost:${port}/scratch/ocr_worker.html in browser to start.`);
});
