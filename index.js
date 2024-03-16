// server.js
const express = require('express');
const app = express();
const port = 3000;
app.use(express.json());

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});

// Dummy data for posts
let posts = [];

// Create a post
app.post('/posts', (req, res) => {
  const { title, content } = req.body;
  const post = { id: posts.length + 1, title, content };
  posts.push(post);
  res.json(post);
});

// Read all posts
// Pagination endpoint
app.get('/posts', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const pageSize = 10;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedPosts = posts.slice(startIndex, endIndex);
    res.json(paginatedPosts);
  });
  

// Read a single post
app.get('/posts/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const post = posts.find(post => post.id === id);
  if (!post) return res.status(404).json({ message: 'Post not found' });
  res.json(post);
});

// Update a post
app.put('/posts/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { title, content } = req.body;
  const index = posts.findIndex(post => post.id === id);
  if (index === -1) return res.status(404).json({ message: 'Post not found' });
  posts[index] = { ...posts[index], title, content };
  res.json(posts[index]);
});

// Delete a post
app.delete('/posts/:id', (req, res) => {
  const id = parseInt(req.params.id);
  posts = posts.filter(post => post.id !== id);
  res.status(204).send();
});

// Middleware
const jwt = require('jsonwebtoken');

// Secret key for JWT
const secretKey = 'your-secret-key';

// Dummy user
const users = [{ username: 'admin', password: 'password' }];

// Authentication middleware
const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// Login endpoint
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(user => user.username === username && user.password === password);
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const token = jwt.sign({ username }, secretKey);
  res.json({ token });
});

// Protected endpoint
app.get('/protected', authenticateUser, (req, res) => {
  res.json({ message: 'Access granted' });
});

// Set up EJS as the view engine
app.set('view engine', 'ejs');

// Render dynamic HTML
app.get('/posts/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const post = posts.find(post => post.id === id);
  if (!post) return res.status(404).json({ message: 'Post not found' });
  res.render('post', { post });
});

// Middleware for file uploads
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Upload endpoint
app.post('/upload', upload.single('image'), (req, res) => {
  const { filename, path } = req.file;
  res.json({ filename, path });
});
