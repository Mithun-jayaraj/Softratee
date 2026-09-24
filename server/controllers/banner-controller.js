const Banner = require('../models/banner');
const getBanners = async (req, res) => {
  try {
    const banners = await Banner.find({});
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching banners' });
  }
};
const createBanner = async (req, res) => {
  const { title, imageUrl, isActive } = req.body;
  try {
    const banner = new Banner({ title, imageUrl, isActive });
    const createdBanner = await banner.save();
    res.status(201).json(createdBanner);
  } catch (error) {
    res.status(500).json({ message: 'Server error creating banner' });
  }
};
const updateBanner = async (req, res) => {
  const { title, imageUrl, isActive } = req.body;
  try {
    const banner = await Banner.findById(req.params.id);
    if (banner) {
      banner.title = title || banner.title;
      banner.imageUrl = imageUrl || banner.imageUrl;
      banner.isActive = isActive !== undefined ? isActive : banner.isActive;
      const updatedBanner = await banner.save();
      res.json(updatedBanner);
    } else {
      res.status(404).json({ message: 'Banner not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error updating banner' });
  }
};
const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (banner) {
      await Banner.deleteOne({ _id: banner._id });
      res.json({ message: 'Banner removed' });
    } else {
      res.status(404).json({ message: 'Banner not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting banner' });
  }
};
module.exports = {
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
};
