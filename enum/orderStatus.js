const orderStatus = Object.freeze({
  // PENDING: "PENDING",
  Preparing:"Preparing",
  Packed: "Packed",
  Dispatched: "Dispatched",
  Delivered: "Delivered",
  Cancelled:"Cancelled"
});

module.exports = { orderStatus };
