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
      joinColumn:{
        name:"user_id",
        referencedColumnName: "id"
      },
    },
    food: {
      target: "Food",
      type: "one-to-one",
      joinColumn:{
        name:"food_id",
        referencedColumnName: "id"
      }
    },
  },
});

module.exports = { CartItem };
