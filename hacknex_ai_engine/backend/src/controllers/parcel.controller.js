const Parcel = require('../models/parcel');

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
