const Design = require('../models/design');
const getDesigns = async (req, res) => {
  try {
    const designs = await Design.find({});
    res.json(designs);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching designs' });
  }
};
const createDesign = async (req, res) => {
  const { name, imageUrl } = req.body;
  try {
    const design = new Design({ name, imageUrl });
    const createdDesign = await design.save();
    res.status(201).json(createdDesign);
  } catch (error) {
    res.status(500).json({ message: 'Server error creating design' });
  }
};
const deleteDesign = async (req, res) => {
  try {
    const design = await Design.findById(req.params.id);
    if (design) {
      await Design.deleteOne({ _id: design._id });
      res.json({ message: 'Design removed' });
    } else {
      res.status(404).json({ message: 'Design not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting design' });
  }
};
module.exports = {
  getDesigns,
  createDesign,
  deleteDesign,
};
