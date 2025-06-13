const express = require('express');
const app = express();

app.use(express.json()); // Body JSON կարդալու համար

// Dummy user list
const users = [
  { id: 1, name: 'Aram', age: 30 },
  { id: 2, name: 'Ani', age: 25 },
  { id: 3, name: 'Gor', age: 27 }
];

// GET /users - Տպում է օգտատերերի ցանկը
app.get('/users', (req, res) => {
  res.status(200).json(users);
});

// Server run
app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});