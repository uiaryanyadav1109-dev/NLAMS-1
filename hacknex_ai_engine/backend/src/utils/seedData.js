const pool = require('../config/db');
// Central coordinate (near Nagpur, India)
const START_LAT = 21.1458;
const START_LNG = 79.0882;

async function seedData() {
  try {
    const client = await pool.connect();
    
    // Enable PostGIS extension for Mapbox/GIS mapping
    await client.query('CREATE EXTENSION IF NOT EXISTS postgis;');
    
    // Drop and recreate table to ensure schema matches
    await client.query('DROP TABLE IF EXISTS land_parcels;');
    await client.query(`
      CREATE TABLE land_parcels (
        id SERIAL PRIMARY KEY,
        plot_number VARCHAR(50) UNIQUE,
        owner_name VARCHAR(100),
        owner_phone VARCHAR(20),
        owner_aadhaar VARCHAR(20),
        owner_address TEXT,
        parcel_area FLOAT,
        valuation FLOAT,
        usage VARCHAR(100),
        owner_color VARCHAR(20),
        latitude FLOAT,
        longitude FLOAT,
        geom GEOMETRY(Polygon, 4326)
      );
    `);
    console.log('Recreated land_parcels table.');

    // Generate 50 dummy farm parcels in a grid
    const parcels = [];
    let id_counter = 1;

    const usages = ['Agriculture', 'Residential', 'Commercial', 'Forest'];
    const colors = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6'];
    const villages = ['Shirur', 'Khed', 'Haveli', 'Maval', 'Mulshi', 'Baramati'];

    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 10; j++) {
        // Size of the parcel (approx 500m x 500m) with slight irregularities
        const lat = START_LAT + (i * 0.005) + (Math.random() * 0.001);
        const lng = START_LNG + (j * 0.005) + (Math.random() * 0.001);
        
        // Slightly irregular polygon coordinates
        const coords = [
          [lng, lat], 
          [lng + 0.004 + (Math.random() * 0.001), lat], 
          [lng + 0.004, lat + 0.004 + (Math.random() * 0.001)], 
          [lng - (Math.random() * 0.001), lat + 0.004], 
          [lng, lat] // Close the polygon
        ];

        const centerLat = lat + 0.002;
        const centerLng = lng + 0.002;

        const usage = usages[Math.floor(Math.random() * usages.length)];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const village = villages[Math.floor(Math.random() * villages.length)];
        
        parcels.push({
          plot_number: `PN-${1000 + id_counter}`,
          owner_name: `Rajendra ${id_counter} Patil`,
          owner_phone: "+91 9" + (Math.floor(Math.random() * 900000000) + 100000000),
          owner_aadhaar: "XXXX-XXXX-" + (Math.floor(Math.random() * 9000) + 1000),
          owner_address: "House No. " + Math.floor(Math.random() * 500) + ", " + village + ", District Pune, Maharashtra",
          area: Math.floor(Math.random() * 50) + 10,
          valuation: Math.floor(Math.random() * 5000000) + 500000,
          usage: usage,
          owner_color: color,
          latitude: centerLat,
          longitude: centerLng,
          geojson: {
            type: "Polygon",
            coordinates: [coords]
          }
        });
        id_counter++;
      }
    }

    // Insert into DB
    for (const parcel of parcels) {
      await client.query(`
        INSERT INTO land_parcels (plot_number, owner_name, owner_phone, owner_aadhaar, owner_address, parcel_area, valuation, usage, owner_color, latitude, longitude, geom)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, ST_SetSRID(ST_GeomFromGeoJSON($12), 4326))
      `, [
        parcel.plot_number, parcel.owner_name, parcel.owner_phone, parcel.owner_aadhaar, parcel.owner_address, 
        parcel.area, parcel.valuation, parcel.usage, parcel.owner_color, parcel.latitude, parcel.longitude, 
        JSON.stringify(parcel.geojson)
      ]);
    }

    console.log(`✅ Successfully inserted ${parcels.length} dummy land parcels!`);
    client.release();
    process.exit(0);

  } catch (err) {
    console.error('Error seeding data:', err);
    process.exit(1);
  }
}

seedData();
