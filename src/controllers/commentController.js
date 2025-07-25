const Comment = require('../models/comment');
const User = require('../models/user');

exports.createComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
    if (!content || !postId) return res.status(400).json({ error: 'Missing content or postId' });
    const comment = await Comment.create({ postId, userId, content });
    const commentWithUser = await Comment.findByPk(comment.id, { include: [{ model: User, as: 'user', attributes: ['username', 'profilePicture', 'id'] }] });
    res.status(201).json(commentWithUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCommentsForPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const comments = await Comment.findAll({
      where: { postId },
      include: [{ model: User, as: 'user', attributes: ['username', 'profilePicture', 'id'] }],
      order: [['createdAt', 'ASC']],
    });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;
    const comment = await Comment.findByPk(commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    if (comment.userId !== userId) return res.status(403).json({ error: 'Not authorized' });
    await comment.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 