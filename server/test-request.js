const http = require('http');

http.get('http://localhost:5000/file-content?filename=test.txt', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(data));
}).on('error', (err) => {
  console.error('Error:', err.message);
}); 