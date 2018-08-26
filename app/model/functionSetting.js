module.exports = app => {
    const { STRING, INTEGER, DATE, DECIMAL, DataTypes } = app.Sequelize

    const FunctionSetting = app.model.define('FunctionSetting', {
      FunctionId: INTEGER,
      ShopId: STRING(10),
      GoodsId: INTEGER,
      DeptId: INTEGER,
      ordermultiple: DECIMAL(10,2) ,
      OrderNum: DECIMAL(10,2) ,
      OrderAmt: DECIMAL,
      DayUpperlimit: DECIMAL(10,2) ,
      DayUpperlimitAmt: DECIMAL,
      // LastModifyDT: {
      //   type: DATE,
      //   defaultValue: DataTypes.NOW
      // }
    }, {
        freezeTableName: true, // Model tableName will be the same as the model name
        timestamps: false,
    })
    return FunctionSetting
}