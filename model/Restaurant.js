const { EntitySchema } = require("typeorm");

const Restaurant = new EntitySchema({
  name: "Restaurant",
  tableName: "restaurants",
  columns: {
    id: {
      primary: true,
      type: "varchar",
      length: 25,
    },
    restaurantName: {
      type: "varchar",
      nullable: false,
      unique: true,
    },
    restaurantAddress: {
      type: "varchar",
      nullable: false,
    },
    restaurantImg: {
      type: "varchar",
      nullable: false,
    },
    restaurantStatus: {
      type: "varchar",
    },
    restaurantPassword: {
      type: "varchar",
      nullable: false,
    },
    openingTime: {
      type: "timestamptz",
      nullable: true,
    },
    closingTime: {
      type: "timestamptz",
      nullable: true,
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
    rating: {
      target: "Rating",
      type: "one-to-one",
      cascade: true,
    },
  },
});

module.exports = { Restaurant };
