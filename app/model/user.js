module.exports = app => {
    const { STRING, INTEGER, DATE } = app.Sequelize;

    const User = app.model.define('Login', {
        LoginID: {
            type: INTEGER,
            primaryKey: true
        },
        Name: STRING(30),
        CName: STRING(32),
        password: STRING(20),
        EnableFlag: INTEGER,
        Note: STRING(50),
        LastModifyDT: DATE,
        IsAdmin: INTEGER
    }, {
        freezeTableName: true, // Model tableName will be the same as the model name
        timestamps: false,
    });

    User.findByMobile = async(mobile) => {
        return await this.findOne({
            where: {
                Name: mobile
            }
        });
    }

    return User;
};