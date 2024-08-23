const EntitySchema = require("typeorm").EntitySchema;
const { paymentMethods } = require("../enum/paymentMethod.js");
const { paymentStatus } = require("../enum/paymentStatus.js");
const { orderStatus } = require("../enum/orderStatus.js");

const Order = new EntitySchema({
  name: "Order",
  tableName: "order",
  columns: {
    id: {
      primary: true,
      type: "varchar",
      length: 25,
    },
    orderStatus: {
      type: "enum",
        enum: orderStatus, 
        default: orderStatus.PENDING
    },
    totalPrice: {
      type: "float",
      nullable: false,
    },
    paymentStatus: {
      type: "enum",
      enum: paymentStatus,
      default: paymentStatus.PENDING,
    },
    deliveryTime:{
      type: "float",
    },
    paymentMethods: {
      type: "enum",
      enum: paymentMethods,
    },
    createdBy: {
      type: "varchar",
      nullable: true,
    },
    createdOn: {
      type: "timestamptz",
      nullable: true,
    },
    modifiedBy: {
      type: "varchar",
      nullable: true,
    },
    modifiedOn: {
      type: "timestamptz",
      nullable: true,
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
    cart: {
      target: "Cart",
      type: "many-to-one",
      joinColumn: {
        name: "cart_id",
        referencedColumnName: "id",
      },
    },
    orderItems: {
      target: "OrderItem",
      type: "one-to-many",
      inverseSide: "order",
    },
  },
});

module.exports = { Order };
