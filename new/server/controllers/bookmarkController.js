import Bookmark from '../models/Bookmark.js';

export const getBookmarks = async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ user: req.user.id });
    res.json(bookmarks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookmarks' });
  }
};

export const addBookmark = async (req, res) => {
  try {
    const { title, url, category, tags } = req.body;
    const bookmark = new Bookmark({
      user: req.user.id,
      title,
      url,
      category,
      tags
    });
    await bookmark.save();
    res.status(201).json(bookmark);
  } catch (error) {
    res.status(500).json({ message: 'Error adding bookmark' });
  }
};

export const deleteBookmark = async (req, res) => {
  try {
    await Bookmark.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });
    res.json({ message: 'Bookmark deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting bookmark' });
  }
};