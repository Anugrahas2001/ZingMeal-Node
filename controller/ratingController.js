const { dataSource } = require("../db/connection");

async function updateRating(req, res) {
  try {
    const { userId, itemId } = req.params;
    console.log(userId, itemId, "userid,itemid");

    const userRepository = dataSource.getRepository("User");
    const user = await userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const allUsers = await userRepository.find();
    console.log(allUsers, "all users");
    const ratingRepository = dataSource.getRepository("Rating");
    const item = await ratingRepository.findOne({
      where: { itemId: itemId },
    });

    const totalUsers=allUsers.length;

    if (!item) {
      return res
        .status(404)
        .json({ message: "Item not found" });
    }
    item.itemRating =
      (item.itemRating * (totalUsers - 1) + req.body.itemRating) / totalUsers;
    await ratingRepository.save(item);

    return res
      .status(200)
      .json({ meassage: "Item rating updated successfully", Data: item });
  } catch (error) {
    return res.status(500).json({ meassage: "Failed to update rating" });
  }
}

module.exports = { updateRating };
