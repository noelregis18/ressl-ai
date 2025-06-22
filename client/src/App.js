import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'http://localhost:5050';

function App() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [newFileName, setNewFileName] = useState('');
  const [newFileContent, setNewFileContent] = useState('');
  const [prompt, setPrompt] = useState('');
  const [message, setMessage] = useState('');
  const [fileInfos, setFileInfos] = useState({});

  // Fetch file list
  const fetchFiles = async () => {
    try {
      const res = await axios.get(`${API_URL}/files`);
      setFiles(res.data.files);
    } catch (err) {
      setMessage('Error fetching files');
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  // Load file content
  const loadFile = async (filename) => {
    setSelectedFile(filename);
    try {
      const fileRes = await axios.get(`${API_URL}/file-content`, { params: { filename } });
      setFileContent(fileRes.data.content);
    } catch (err) {
      setFileContent('');
      setMessage('Error loading file');
    }
  };

  // Create file
  const handleCreateFile = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/file`, { filename: newFileName, content: newFileContent });
      setMessage('File created');
      setNewFileName('');
      setNewFileContent('');
      fetchFiles();
    } catch (err) {
      setMessage('Error creating file');
    }
  };

  // Edit file
  const handleEditFile = async () => {
    if (!selectedFile) return;
    try {
      await axios.put(`${API_URL}/file`, { filename: selectedFile, content: prompt });
      setMessage('File updated');
      setFileContent(prompt);
      setPrompt('');
      fetchFiles();
    } catch (err) {
      setMessage('Error editing file');
    }
  };

  // Delete file
  const handleDeleteFile = async (filename) => {
    try {
      await axios.delete(`${API_URL}/file`, { data: { filename } });
      setMessage('File deleted');
      setSelectedFile('');
      setFileContent('');
      fetchFiles();
    } catch (err) {
      setMessage('Error deleting file');
    }
  };

  // Upload files/folder
  const handleUpload = async (e) => {
    const files = e.target.files;
    if (!files.length) return;
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i], files[i].webkitRelativePath || files[i].name);
    }
    try {
      await axios.post(`${API_URL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage('Files uploaded');
      fetchFiles();
    } catch (err) {
      setMessage('Error uploading files');
      console.error('Upload error:', err.response ? err.response.data : err);
    }
  };

  // Helper to detect text files by extension
  const isTextFile = (filename) => {
    return /\.(txt|js|json|md|css|html|csv|xml|py|java|c|cpp|ts|tsx|log)$/i.test(filename);
  };

  return (
    <div className="App">
      <h1>MCP File Manager</h1>
      {message && <div style={{ color: 'red' }}>{message}</div>}
      <div style={{ display: 'flex', gap: '2rem' }}>
        <div>
          <h2>Files</h2>
          <ul>
            {files.map((file) => (
              <li key={file} style={{ marginBottom: 8 }}>
                <button onClick={() => loadFile(file)}>{file}</button>
                <button onClick={() => handleDeleteFile(file)} style={{ marginLeft: 8, color: 'red' }}>Delete</button>
              </li>
            ))}
          </ul>
          <h2>Upload Files/Folder</h2>
          <input
            type="file"
            multiple
            webkitdirectory="true"
            onChange={handleUpload}
          />
        </div>
        <div>
          <h2>Create File</h2>
          <form onSubmit={handleCreateFile}>
            <input
              type="text"
              placeholder="Filename"
              value={newFileName}
              onChange={e => setNewFileName(e.target.value)}
              required
            />
            <br />
            <textarea
              placeholder="File content"
              value={newFileContent}
              onChange={e => setNewFileContent(e.target.value)}
              rows={4}
              cols={30}
            />
            <br />
            <button type="submit">Create</button>
          </form>
        </div>
        <div>
          <h2>Edit File</h2>
          {selectedFile ? (
            <div>
              <div><b>Editing:</b> {selectedFile}</div>
              {isTextFile(selectedFile) ? (
                <>
                  <textarea
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    placeholder="Enter new content for the file"
                    rows={6}
                    cols={40}
                  />
                  <br />
                  <button onClick={handleEditFile}>Save Edit</button>
                  <h3>Current Content:</h3>
                  <pre style={{ background: '#eee', padding: 10 }}>{fileContent}</pre>
                </>
              ) : (
                <>
                  <div style={{ color: 'orange', margin: '1em 0' }}>
                    This file type cannot be displayed or edited as text.
                  </div>
                </>
              )}
            </div>
          ) : (
            <div>Select a file to edit</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
