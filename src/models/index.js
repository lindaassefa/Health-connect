const sequelize = require('../config/database');
const User = require('./user');
const Post = require('./post');
const Likes = require('./likes');
const Follows = require('./Follows');

// Likes associations
User.hasMany(Likes, { foreignKey: 'userId', as: 'userLikes' });
Post.hasMany(Likes, { foreignKey: 'postId', as: 'postLikes' });
Likes.belongsTo(User, { foreignKey: 'userId' });
Likes.belongsTo(Post, { foreignKey: 'postId' });

// Follow associations - Many-to-Many
User.belongsToMany(User, {
  through: Follows,
  as: 'followers',
  foreignKey: 'followingId',
  otherKey: 'followerId'
});

User.belongsToMany(User, {
  through: Follows,
  as: 'following',
  foreignKey: 'followerId',
  otherKey: 'followingId'
});

// Additional Follow associations for detailed queries
Follows.belongsTo(User, { as: 'follower', foreignKey: 'followerId' });
Follows.belongsTo(User, { as: 'following', foreignKey: 'followingId' });

User.hasMany(Follows, { as: 'followerRelations', foreignKey: 'followerId' });
User.hasMany(Follows, { as: 'followingRelations', foreignKey: 'followingId' });

module.exports = {
  sequelize,
  User,
  Post,
  Likes,
  Follows
};