const { dataSource } = require("../db/connection");

async function updateRating(req, res) {
  try {
    const { userId, itemId } = req.params;
    const { itemRating } = req.body;

    const userRepository = dataSource.getRepository("User");
    const user = await userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const ratingRepository = dataSource.getRepository("Rating");
    const item = await ratingRepository.findOne({
      where: { itemId: itemId },
    });

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    const modifiedByUsers = item.modifiedBy ? item.modifiedBy.split(",") : [];
    if (!modifiedByUsers.includes(userId)) {
      modifiedByUsers.push(userId);
    }

    const totalUsers = modifiedByUsers.length;
    item.itemRating = Number(
      ((item.itemRating * (totalUsers - 1) + itemRating) / totalUsers).toFixed(
        1
      )
    );
    item.modifiedBy = user.name;
    item.modifiedOn = new Date();
    await ratingRepository.save(item);

    return res
      .status(200)
      .json({ meassage: "Item rating updated successfully", Data: item });
  } catch (error) {
    return res.status(500).json({ meassage: "Failed to update rating" });
  }
}

async function getRatingById(req,res){
  const {itemId}=req.params;
}

module.exports = { updateRating };
