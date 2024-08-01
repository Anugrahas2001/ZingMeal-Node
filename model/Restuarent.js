const { EntitySchema } = require("typeorm");

const Restuarent = new EntitySchema({
  name: "Restuarent",
  tableName: "restuarents",
  columns: {
    id: {
      primary: true,
      type: "varchar",
      length: 25,
    },
    restuarentName: {
      type: "varchar",
      nullable: false,
      unique: true,
    },
    restuarentImg: {
      type: "varchar",
      nullable: false,
    },
    restuarentStatus: {
      type: "varchar",
    },
    restuarentPassword: {
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

module.exports = { Restuarent };
