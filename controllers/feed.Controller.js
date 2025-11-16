export const getHomeFeed = async (req, res) => {
  try {
    res.json({ feed: [] });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching feed' });
  }
};
