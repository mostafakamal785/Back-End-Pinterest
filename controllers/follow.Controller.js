export const followUser = async (req, res) => {
  try {
    res.json({ message: 'Followed successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error following user' });
  }
};

export const unfollowUser = async (req, res) => {
  try {
    res.json({ message: 'Unfollowed successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error unfollowing user' });
  }
};

export const getFollowers = async (req, res) => {
  try {
    res.json({ followers: [] });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching followers' });
  }
};

export const getFollowing = async (req, res) => {
  try {
    res.json({ following: [] });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching following' });
  }
};
