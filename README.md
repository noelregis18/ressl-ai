# MCP File Manager

A full-stack web application to manage files and folders in a specified workspace. Users can upload folders/files, view, edit, and delete text files, and see file info. Binary files are protected from editing.

## Features
- Upload multiple files or entire folders (with structure preserved)
- List all files in the workspace
- View and edit text files (e.g., .txt, .js, .json, .md)
- Prevent editing/viewing of binary files (e.g., images, audio, video, Office docs)
- Delete files
- See file size and last modified info
- Simple, modern React UI

## Tech Stack
- **Frontend:** React (Create React App)
- **Backend:** Node.js, Express, Multer

## Setup & Usage

### 1. Clone the repository
```sh
git clone <your-repo-url>
cd Assignment\ 9
```

### 2. Install dependencies
```sh
cd server
npm install
cd ../client
npm install
```

### 3. Start the backend
```sh
cd ../server
node index.js
```

### 4. Start the frontend
```sh
cd ../client
npm start
```

### 5. Open the app
Go to [http://localhost:3000](http://localhost:3000)

## Folder Structure
- `server/workspace/` — All uploaded and managed files are stored here.
- `client/` — React frontend
- `server/` — Node.js backend

## Notes
- Only text files can be edited/viewed in the browser.
- Binary files show a message and cannot be edited.
- File size and last modified info are shown in the file list.

---

**Developed for the MCP assignment.** 