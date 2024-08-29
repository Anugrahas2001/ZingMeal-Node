const EntitySchema = require("typeorm").EntitySchema;

const Cart = new EntitySchema({
  name: "Cart",
  tableName: "cart",
  columns: {
    id: {
      primary: true,
      type: "varchar",
      length: 25,
    },
    totalPrice: {
      type: "float",
    },
    deliveryCharge: {
      type: "float",
      default: 0,
    },
    deliveryTime:{
      type: "float",
    },
    createdBy: {
      type: "varchar",
      nullable: true,
    },
    createdOn: {
      type: "timestamp",
      nullable: true,
    },
    modifiedBy: {
      type: "varchar",
      nullable: true,
    },
    modifiedOn: {
      type: "timestamp",
      nullable: true,
    },
  },
  relations: {
    user: {
      target: "User",
      type: "one-to-one",
      joinColumn: {
        name: "user_id",
        referencedColumnName: "id",
      },
    },
    cartItems: {
      target: "CartItem",
      type: "one-to-many",
      inverseSide: "cart",
    },
  },
});

module.exports = { Cart };
