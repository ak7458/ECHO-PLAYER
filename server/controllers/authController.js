const fs = require('fs');
const path = require('path');

const usersFile = path.join(__dirname, '../users.json');

// Ensure users.json exists
if (!fs.existsSync(usersFile)) {
  fs.writeFileSync(usersFile, JSON.stringify([]));
}

const getUsers = () => JSON.parse(fs.readFileSync(usersFile, 'utf8'));
const saveUsers = (users) => fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

exports.register = (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const users = getUsers();
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'Email already exists' });
  }

  const newUser = {
    id: Date.now().toString(),
    email,
    password, // Storing plaintext for prototype speed
    name,
    avatar: `https://i.pravatar.cc/150?u=${email}`,
    isPremium: true, // Everyone gets premium in this demo
    followers: Math.floor(Math.random() * 1000),
    following: Math.floor(Math.random() * 500),
    listeningTime: Math.floor(Math.random() * 2000),
    likedSongs: [],
    playlists: []
  };

  users.push(newUser);
  saveUsers(users);

  // Don't send password back
  const { password: _, ...safeUser } = newUser;
  res.status(201).json({ user: safeUser });
};

exports.login = (req, res) => {
  const { email, password } = req.body;
  const users = getUsers();
  
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const { password: _, ...safeUser } = user;
  res.json({ user: safeUser });
};

exports.updateProfile = (req, res) => {
  const { id, name, avatar } = req.body;
  const users = getUsers();
  
  const userIndex = users.findIndex(u => u.id === id);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (name) users[userIndex].name = name;
  if (avatar) users[userIndex].avatar = avatar;

  saveUsers(users);
  
  const { password: _, ...safeUser } = users[userIndex];
  res.json({ user: safeUser });
};

exports.uploadAvatar = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  const avatarUrl = `/uploads/avatars/${req.file.filename}`;
  res.json({ avatarUrl });
};

exports.getLibrary = (req, res) => {
  const users = getUsers();
  const user = users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  
  res.json({ 
    likedSongs: user.likedSongs || [], 
    playlists: user.playlists || [] 
  });
};

exports.updateLibrary = (req, res) => {
  const { id, likedSongs, playlists } = req.body;
  if (!id) return res.status(400).json({ error: 'User ID required' });
  
  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === id);
  if (userIndex === -1) return res.status(404).json({ error: 'User not found' });
  
  if (likedSongs !== undefined) users[userIndex].likedSongs = likedSongs;
  if (playlists !== undefined) users[userIndex].playlists = playlists;
  
  saveUsers(users);
  res.json({ success: true });
};
