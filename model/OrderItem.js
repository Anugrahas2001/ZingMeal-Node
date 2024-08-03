const { JoinColumn } = require("typeorm");

const EntitySchema = require("typeorm").EntitySchema;

const OrderItem = new EntitySchema({
  name: "OrderItem",
  tableName: "orderItem",
  columns: {
    id: {
      primary: true,
      type: "varchar",
      length: 25,
    },
    quantity: {
      type: "float",
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
    order: {
      target: "Order",
      type: "many-to-one",
      JoinColumn: true,
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

module.exports = { OrderItem };
