require('dotenv').config();
const express = require('express');
const cors = require('cors');

const parcelRoutes = require('./src/routes/parcel.routes');
// const authRoutes = require('./src/routes/auth.routes');
// Add other routes here

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/parcels', parcelRoutes);
// app.use('/api/auth', authRoutes);

app.get('/', (req, res) => res.send('<h1>NLAMS Backend is Running!</h1><p>Visit <a href="/api/health">/api/health</a> or <a href="/api/parcels">/api/parcels</a></p>'));
app.get('/api/health', (req, res) => res.json({ status: 'ok', structure: 'MVC setup complete' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
