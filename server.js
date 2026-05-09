const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8080;

const CACHE_DIR = path.join(__dirname, 'cache');
const START_CH = 879;
const END_CH = 2446;

// Get chapter from pre-converted cache
function getChapter(chNum) {
  const filePath = path.join(CACHE_DIR, `chapter_${chNum}.txt`);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const firstNewline = content.indexOf('\n');
  const title = firstNewline > 0 ? content.substring(0, firstNewline) : content;
  const body = firstNewline > 0 ? content.substring(firstNewline + 1) : '';
  
  return { num: chNum, title: title.trim(), body: body.trim() };
}

// API: list all chapters
app.get('/api/chapters', (req, res) => {
  const chapters = [];
  for (let ch = START_CH; ch <= END_CH; ch++) {
    const filePath = path.join(CACHE_DIR, `chapter_${ch}.txt`);
    chapters.push({ num: ch, exists: fs.existsSync(filePath) });
  }
  const exists = chapters.filter(c => c.exists).length;
  res.json({ success: true, total: chapters.length, exists, start: START_CH, end: END_CH });
});

// API: get single chapter
app.get('/api/chapter/:num', (req, res) => {
  const chNum = parseInt(req.params.num);
  if (chNum < START_CH || chNum > END_CH) {
    return res.status(404).json({ success: false, error: 'Chapter out of range' });
  }
  
  const chapter = getChapter(chNum);
  if (!chapter) {
    return res.status(404).json({ success: false, error: 'Chapter not found' });
  }
  
  res.json({ success: true, chapter });
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`凡人修仙傳 Reader running at http://localhost:${PORT}`);
});