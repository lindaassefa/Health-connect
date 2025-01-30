const { Likes, Post } = require('../models');

exports.likePost = async (req, res) => {
 const { postId } = req.params;
 const userId = req.user.id;

 try {
   console.log('Like attempt:', { postId, userId });
   
   // Cast postId to integer 
   const numericPostId = parseInt(postId, 10);
   console.log('Parsed numericPostId:', numericPostId);
   const post = await Post.findByPk(numericPostId);
   console.log('Found post:', post);

   if (!post) {
     console.log('Post not found:', postId);
     return res.status(404).json({ error: 'Post not found' });
   }

   const [likes, created] = await Likes.findOrCreate({
     where: { 
       postId: numericPostId, 
       userId 
     }
   });

   if (!created) {
     console.log('Already liked:', postId, userId);
     return res.status(400).json({ error: 'Post already liked' });
   }

   const likeCount = await Likes.count({ where: { postId: numericPostId } });
   console.log('Like count:', likeCount);
   
   res.status(201).json({ likeCount, isLiked: true });
   
 } catch (error) {
   console.error('Detailed error:', {
     name: error.name,
     message: error.message,
     stack: error.stack
   });
   res.status(500).json({ error: error.message });
 }
};

exports.unlikePost = async (req, res) => {
 const { postId } = req.params;
 const userId = req.user.id;

 try {
   const numericPostId = parseInt(postId, 10);
   
   const like = await Likes.findOne({ 
     where: { 
       postId: numericPostId, 
       userId 
     }
   });

   if (!like) {
     console.log('Like not found:', postId, userId);
     return res.status(404).json({ error: 'Like not found' });
   }

   await like.destroy();
   const likeCount = await Likes.count({ where: { postId: numericPostId } });
   console.log('Like count after unlike:', likeCount);

   res.status(200).json({ likeCount, isLiked: false });
 } catch (error) {
   console.error('Unlike error:', error);
   console.error('Detailed error during likePost:', error);
   res.status(500).json({ error: error.message });

 }
}; 