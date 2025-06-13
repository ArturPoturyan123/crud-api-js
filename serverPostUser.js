const express = require('express');
const app = express();

app.use(express.json()); // middleware՝ որպեսզի կարողանանք կարդալ JSON body

// POST ռաութ՝ օգտատեր ավելացնելու համար
app.post('/user', (req, res) => {
  const { name, age, email } = req.body;

  console.log('Received user data:', req.body);

  res.status(201).json({
    message: 'User received successfully',
    user: {
      name,
      age,
      email
    }
  });
});

app.listen(4000, () => {
  console.log('Server running at http://localhost:4000');
});