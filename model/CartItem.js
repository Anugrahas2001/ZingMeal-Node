const { JoinColumn } = require("typeorm");

const EntitySchema = require("typeorm").EntitySchema;

const CartItem = new EntitySchema({
  name: "CartItem",
  tableName: "cartItems",
  columns: {
    id: {
      primary: true,
      type: "varchar",
      length: 25,
    },
    cartId: {
      type: "varchar",
      nullable: false,
    },
    quantity: {
      type: "int",
      nullable: false,
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
      cascade: true,
    },
  },
  relations: {
    food: {
      target: "Food",
      type: "one-to-one",
      JoinColumn: true,
    },
  },
});

module.exports = { CartItem };
