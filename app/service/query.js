'use strict'
const Service = require('egg').Service

class QueryService extends Service {
  async shop3ReviewCount() {
    const { ctx } = this
  	const res = await ctx.model.query(`
SELECT   Value AS shopid,
                    (SELECT   COUNT(1) AS Expr1
                     FROM      ${this.config.DBStock}.dbo.PurchaseAsk AS pa
                     WHERE   EXISTS
                                         (SELECT   1 AS Expr1
                                          FROM      ${this.config.DBOrderReview}.dbo.PurchaseControlItemLogs AS l
                                          WHERE   (pa.SheetID = SheetID) AND (l.GoodsID = -21))) AS count
FROM      ${this.config.DBStock}.dbo.Config AS c
WHERE   (Name = '本店号') 
`,  { replacements: { }, type: ctx.model.QueryTypes.SELECT })

    this.logger.debug('cur shop info'+ JSON.stringify(res))
    if (res.length === 0) {
      this.ctx.throw(404, 'ShopInfo not found')
    }
    return res[0]
  }
}


module.exports = QueryService