const pool = require('../config/db');

class Parcel {
  static async getAll() {
    const query = `
      SELECT json_build_object(
        'type', 'FeatureCollection',
        'features', json_agg(ST_AsGeoJSON(t.*)::json)
      ) AS geojson
      FROM (
        SELECT id, plot_number, owner_name, owner_phone, owner_aadhaar, owner_address, parcel_area, valuation, usage, owner_color, latitude, longitude, geom FROM land_parcels
      ) AS t;
    `;
    const { rows } = await pool.query(query);
    return rows[0].geojson || { type: 'FeatureCollection', features: [] };
  }

  static async findByPlotNumber(plotNumber) {
    const query = `
      SELECT id, plot_number, owner_name, owner_phone, owner_aadhaar, owner_address, parcel_area, valuation, usage, owner_color, latitude, longitude, ST_AsGeoJSON(geom)::json AS geometry
      FROM land_parcels
      WHERE plot_number = $1;
    `;
    const { rows } = await pool.query(query, [plotNumber]);
    return rows[0];
  }
}
module.exports = Parcel;
