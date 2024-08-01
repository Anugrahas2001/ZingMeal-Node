var EntitySchema = require("typeorm").EntitySchema;

class BaseEntity {
  constructor() {
    this.createdOn = new Date();
    this.modifiedOn = new Date();
  }

  setCreateEntity(user) {
    this.createdBy = user;
    this.createdOn = new Date();
  }

  setModifyEntity(user) {
    this.modifiedBy = user;
    this.modifiedOn = new Date();
  }
}

const BaseEntitySchema = new EntitySchema({
    name:"BaseEntity",
    target: BaseEntity,
  columns: {
    createdBy: {
      type: "varchar",
      nullable: true,
    },
    modifiedBy: {
      type: "varchar",
      nullable: true,
    },
    createdOn: {
      type: "timestamptz",
      nullable: true,
    },
    modifiedOn: {
      type: "timestamptz",
      nullable: true,
    },
  },
});

module.exports = { BaseEntitySchema, BaseEntity };
