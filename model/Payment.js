const { paymentMethods } = require("../enum/paymentMethod");

const EntitySchema = require("typeorm").EntitySchema;

const Payment = new EntitySchema({
  name: "Payment",
  tableName: "payment",
  columns: {
    id: {
      primary: true,
      type: "varchar",
      length: 25,
    },
    razorpayPaymentId: {
      type: "varchar",
      unique: true,
      nullable: true,
    },
    razorpayOrderId: {
      type: "varchar",
      unique: true,
    },
    razorpaySignature: {
      type: "varchar",
      nullable: true,
    },
    paymentMethods: {
      type: "enum",
      enum: Object.values(paymentMethods),
    },
    createdOn: {
      type: "timestamp",
      nullable: false,
    },
  },
  relations: {
    user: {
      target: "User",
      type: "many-to-one",
      joinColumn: {
        name: "user_id",
        referencedColumnName: "id",
      },
    },
    order: {
      target: "Order",
      type: "one-to-one",
      joinColumn: {
        name: "order_id",
        referencedColumnName: "id",
      },
    },
  },
});
module.exports = { Payment };
