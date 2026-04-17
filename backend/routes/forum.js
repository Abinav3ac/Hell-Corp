const express = require('express');
const router = express.Router();
const ForumPost = require('../models/Forum');
const { verifyToken, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, async (req, res) => {
  try {
    const posts = await ForumPost.find({})
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(50)
      .select('-replies');
    res.json({ posts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const post = new ForumPost({
      ...req.body,
      author: req.user._id,
      authorName: req.user.username
    });
    await post.save();
    res.status(201).json({ success: true, post });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const post = await ForumPost.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json({ post });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/reply', verifyToken, async (req, res) => {
  try {
    const post = await ForumPost.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          replies: {
            author: req.user._id,
            authorName: req.user.username,
            content: req.body.content
          }
        }
      },
      { new: true }
    );
    res.json({ success: true, post });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
