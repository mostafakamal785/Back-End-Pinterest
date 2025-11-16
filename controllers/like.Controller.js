export const likePin = async (req, res) => {
  try {
    res.json({ message: 'Pin liked' });
  } catch (err) {
    res.status(500).json({ error: 'Error liking pin' });
  }
};

export const unlikePin = async (req, res) => {
  try {
    res.json({ message: 'Pin unliked' });
  } catch (err) {
    res.status(500).json({ error: 'Error unliking pin' });
  }
};

export const getLikes = async (req, res) => {
  try {
    res.json({ likes: [] });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching likes' });
  }
};
