const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = 5050;
const WORKSPACE_DIR = path.join(__dirname, 'workspace');

app.use(cors());
app.use(express.json());

// Helper to get safe file path
function getSafeFilePath(filename) {
  const filePath = path.join(WORKSPACE_DIR, filename);
  if (!filePath.startsWith(WORKSPACE_DIR)) {
    throw new Error('Invalid file path');
  }
  return filePath;
}

// Multer storage config to preserve folder structure
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Support nested folders from webkitRelativePath/originalname
    const relPath = file.originalname.includes('/') ? path.dirname(file.originalname) : '';
    const dest = path.join(WORKSPACE_DIR, relPath);
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    // Save just the base name
    cb(null, path.basename(file.originalname));
  },
});
const upload = multer({ storage });

// Root endpoint for health check
app.get('/', (req, res) => {
  console.log('Received GET /');
  res.json({ message: 'Backend server is running!' });
});

// List files in workspace
app.get('/files', (req, res) => {
  console.log('Received GET /files');
  try {
    const files = fs.readdirSync(WORKSPACE_DIR);
    res.json({ files });
  } catch (err) {
    console.error('Error listing files:', err);
    res.status(500).json({ error: err.message });
  }
});

// List files with size and last modified info
app.get('/files-info', (req, res) => {
  try {
    const files = fs.readdirSync(WORKSPACE_DIR).map(name => {
      const stat = fs.statSync(path.join(WORKSPACE_DIR, name));
      return {
        name,
        size: stat.size,
        mtime: stat.mtime
      };
    });
    res.json({ files });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get file content
app.get('/file-content', (req, res) => {
  console.log('Received GET /file-content', req.query);
  const { filename } = req.query;
  if (!filename) return res.status(400).json({ error: 'Filename required' });
  try {
    const filePath = getSafeFilePath(filename);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });
    const content = fs.readFileSync(filePath, 'utf-8');
    res.json({ content });
  } catch (err) {
    console.error('Error getting file content:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create a file
app.post('/file', (req, res) => {
  console.log('Received POST /file', req.body);
  const { filename, content } = req.body;
  if (!filename) return res.status(400).json({ error: 'Filename required' });
  try {
    const filePath = getSafeFilePath(filename);
    fs.writeFileSync(filePath, content || '');
    res.json({ message: 'File created' });
  } catch (err) {
    console.error('Error creating file:', err);
    res.status(500).json({ error: err.message });
  }
});

// Edit a file
app.put('/file', (req, res) => {
  console.log('Received PUT /file', req.body);
  const { filename, content } = req.body;
  if (!filename) return res.status(400).json({ error: 'Filename required' });
  try {
    const filePath = getSafeFilePath(filename);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });
    fs.writeFileSync(filePath, content || '');
    res.json({ message: 'File updated' });
  } catch (err) {
    console.error('Error editing file:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete a file
app.delete('/file', (req, res) => {
  console.log('Received DELETE /file', req.body);
  const { filename } = req.body;
  if (!filename) return res.status(400).json({ error: 'Filename required' });
  try {
    const filePath = getSafeFilePath(filename);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });
    fs.unlinkSync(filePath);
    res.json({ message: 'File deleted' });
  } catch (err) {
    console.error('Error deleting file:', err);
    res.status(500).json({ error: err.message });
  }
});

// Upload files/folder endpoint
app.post('/upload', upload.array('files'), (req, res) => {
  console.log('Received POST /upload', req.files.map(f => f.originalname));
  res.json({ message: 'Files uploaded', files: req.files.map(f => f.originalname) });
});

// GET /upload for clarity (not used for uploads)
app.get('/upload', (req, res) => {
  res.status(405).json({ error: 'Use POST /upload to upload files.' });
});

// Download endpoint for any file in workspace
app.get('/download', (req, res) => {
  const { filename } = req.query;
  if (!filename) return res.status(400).json({ error: 'Filename required' });
  try {
    const filePath = getSafeFilePath(filename);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });
    res.download(filePath, path.basename(filename));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve static files from the workspace directory
app.use('/workspace', express.static(WORKSPACE_DIR));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 