'use strict'
const Service = require('egg').Service

class QueryService extends Service {
  async shop3ReviewCount() {
    const { ctx } = this
  	const res = await ctx.model.query(`
SELECT   Value AS shopid,
                    (SELECT   COUNT(1) AS Expr1
                     FROM      ${this.config.DBStock}.dbo.PurchaseAsk0 AS pa
                     WHERE pa.Flag<> 99 and  EXISTS
                                         (SELECT   1 AS Expr1
                                          FROM      ${this.config.DBOrderReview}.dbo.PurchaseControlItemLogs AS l
                                          WHERE   (pa.SheetID = SheetID) AND (l.serialid = -12))) AS count
FROM      ${this.config.DBStock}.dbo.Config AS c
WHERE   (Name = '本店号') 
`,  { replacements: { }, type: ctx.model.QueryTypes.SELECT })

    this.logger.info('cur shop info'+ JSON.stringify(res))
    if (res.length === 0) {
      this.ctx.throw(404, 'ShopInfo not found')
    }
    return res[0]
  }

  async curShopId() {
    const { ctx } = this
    
    const sql = `select value from ${this.config.DBStock}.dbo.config c where c.Name='本店号' `
    const res = await ctx.model.query(sql, { type: ctx.model.QueryTypes.SELECT })
    if (res.length === 0) {
      throw new Error('本店号不存在')
    }
    return res[0].value
  }

  async syncMaster() {
    const { ctx } = this
    await ctx.model.query(`  exec ${this.config.DBOrderReview}..SyncMaster `,  { replacements: { }, type: ctx.model.QueryTypes.INSERT })
  }

  async rejectToday() {
    const { ctx } = this
    await ctx.model.query(`  exec ${this.config.DBOrderReview}..rejectTodayPurchaseAsk0 `,  { replacements: { }, type: ctx.model.QueryTypes.INSERT })
  }

  async rollbackReview() {
    const { ctx } = this
    await ctx.model.query(`  exec ${this.config.DBOrderReview}..RollbackReview `,  { replacements: { }, type: ctx.model.QueryTypes.INSERT })
  }

  async syncUser() {
    const { ctx } = this
    await ctx.model.query(`  insert into ${this.config.DBOrderReview}..Login ([LoginID]
      ,[Name]
      ,[CName]
      ,[password]
      ,[EnableFlag]
      ,[Note]
      ,[LastModifyDT]
      ,[IsAdmin])
      select  [LoginID],[Name],[CName],[Name],1,note,getdate(),0  from ${this.config.DBConnect}..Login a where EnableFlag =1
      and
      not exists (select 1 from ${this.config.DBOrderReview}..Login b where a.LoginID =b.LoginID)
      `,  { replacements: { }, type: ctx.model.QueryTypes.INSERT })
  }


async syncFunctionSetting(data) {
    const { ctx } = this
    this.logger.info('syncFunctionSetting: data count '+ data.length)
    const dsql = `delete from ${this.config.DBOrderReview}.dbo.FunctionSetting `
    return ctx.model.transaction(async function (t) {
      //delete 
      await ctx.model.query(dsql, { transaction: t, type: ctx.model.QueryTypes.DELETE })
             
        //insert
      await ctx.model.FunctionSetting.bulkCreate(data, { transaction: t, logging: false })    
     
    }).then(function () {
      // Transaction has been committed
      // result is whatever the result of the promise chain returned to the transaction callback
       
    }).catch(function (err) {
      // Transaction has been rolled back
      // err is whatever rejected the promise chain returned to the transaction callback
      throw err
    });
  }

  async syncOrderControl(data) {
    const { ctx } = this
    this.logger.info('syncOrderControl: data count '+ data.length)
    const dsql = `delete from ${this.config.DBOrderReview}.dbo.OrderControl `
    return ctx.model.transaction(async function (t) {
      //delete 
      await ctx.model.query(dsql, { transaction: t, type: ctx.model.QueryTypes.DELETE })
             
        //insert
      await ctx.model.OrderControl.bulkCreate(data, { transaction: t , logging: false })    
     
    }).then(function () {
      // Transaction has been committed
      // result is whatever the result of the promise chain returned to the transaction callback
       
    }).catch(function (err) {
      // Transaction has been rolled back
      // err is whatever rejected the promise chain returned to the transaction callback
      throw err
    });
  }


}


module.exports = QueryService