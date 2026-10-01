const fs = require('fs');
const path = require('path');

const dirs = [
  'src/config',
  'src/middleware',
  'src/models',
  'src/routes',
  'src/controllers',
  'src/utils'
];

const files = {
  '.env': `PORT=3000
DB_USER=nlams_user
DB_PASSWORD=nlams_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nlams_gis
FIREBASE_PROJECT_ID=dummy-id
FIREBASE_PRIVATE_KEY="dummy-key"
FIREBASE_CLIENT_EMAIL="dummy@dummy.com"
`,
  'server.js': `require('dotenv').config();
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

app.get('/api/health', (req, res) => res.json({ status: 'ok', structure: 'MVC setup complete' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\`🚀 Server running on port \${PORT}\`);
});
`,
  'src/config/db.js': `const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

module.exports = pool;
`,
  'src/config/firebase.js': `// const admin = require('firebase-admin');
// admin.initializeApp({ credential: admin.credential.cert(...) });
// module.exports = admin;
module.exports = {}; // Placeholder until actual keys are provided
`,
  'src/middleware/auth.js': `// const admin = require('../config/firebase');
module.exports.verifyToken = async (req, res, next) => {
  // Dummy auth middleware
  // const token = req.headers.authorization?.split(' ')[1];
  // verify with firebase admin...
  req.user = { uid: '123', role: 'State' }; // mock
  next();
};
`,
  'src/middleware/rbac.js': `module.exports.checkRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
};
`,
  'src/models/parcel.js': `const pool = require('../config/db');

class Parcel {
  static async getAll() {
    const query = \`
      SELECT json_build_object(
        'type', 'FeatureCollection',
        'features', json_agg(ST_AsGeoJSON(t.*)::json)
      ) AS geojson
      FROM (
        SELECT id, plot_number, owner_name, parcel_area, valuation, usage, owner_color, geom FROM land_parcels
      ) AS t;
    \`;
    const { rows } = await pool.query(query);
    return rows[0].geojson || { type: 'FeatureCollection', features: [] };
  }

  static async findByPlotNumber(plotNumber) {
    const query = \`
      SELECT id, plot_number, owner_name, parcel_area, valuation, usage, owner_color, ST_AsGeoJSON(geom)::json AS geometry
      FROM land_parcels
      WHERE plot_number = $1;
    \`;
    const { rows } = await pool.query(query, [plotNumber]);
    return rows[0];
  }
}
module.exports = Parcel;
`,
  'src/controllers/parcel.controller.js': `const Parcel = require('../models/parcel');

exports.getAllParcels = async (req, res) => {
  try {
    const geojson = await Parcel.getAll();
    res.json(geojson);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.searchParcel = async (req, res) => {
  const { plot_number } = req.query;
  if (!plot_number) return res.status(400).json({ error: 'plot_number is required' });
  
  try {
    const parcel = await Parcel.findByPlotNumber(plot_number);
    if (!parcel) return res.status(404).json({ error: 'Plot not found' });
    res.json(parcel);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
`,
  'src/routes/parcel.routes.js': `const express = require('express');
const router = express.Router();
const parcelController = require('../controllers/parcel.controller');
// const { verifyToken } = require('../middleware/auth');

// We can add verifyToken middleware here later
router.get('/', parcelController.getAllParcels);
router.get('/search', parcelController.searchParcel);

module.exports = router;
`
};

const entities = ['user', 'proposal', 'project', 'compensation', 'document', 'notification'];
entities.forEach(ent => {
  const cap = ent.charAt(0).toUpperCase() + ent.slice(1);
  files['src/models/' + ent + '.js'] = "const pool = require('../config/db');\\nclass " + cap + " {}\\nmodule.exports = " + cap + ";";
  files['src/controllers/' + ent + '.controller.js'] = "const " + cap + " = require('../models/" + ent + "');\\nexports.dummy = (req, res) => res.json({ msg: '" + ent + " controller' });";
  files['src/routes/' + ent + '.routes.js'] = "const express = require('express');\\nconst router = express.Router();\\nconst controller = require('../controllers/" + ent + ".controller');\\nrouter.get('/', controller.dummy);\\nmodule.exports = router;";
});

// utils
files['src/utils/helpers.js'] = "module.exports = {};";
files['src/utils/seedData.js'] = "// move your seed.js logic here";

dirs.forEach(d => fs.mkdirSync(path.join(__dirname, d), { recursive: true }));

Object.keys(files).forEach(file => {
  fs.writeFileSync(path.join(__dirname, file), files[file]);
});

console.log('✅ Backend architecture successfully scaffolded!');
