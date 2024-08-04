const cuid = require("cuid");

async function addToCart(req, res) {
  const { id } = req.params;
  console.log(id, "food id");
  const cartId=cuid();

  const cart = {
    id:cuid(),
    cartId:cartId,
    quantity:1,
    user:userId,
    food:foodId
  };
}

module.exports = { addToCart };
