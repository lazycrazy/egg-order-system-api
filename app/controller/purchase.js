const Controller = require('egg').Controller

class PurchaseController extends Controller {
  constructor(ctx) {
    super(ctx)
  } 

  async reviewAuth() {
    const { ctx } = this
    const res = await ctx.model.query(`
select isnull(max(rf.FunctionId ),0) auth 
from mySHOPSHConnect..PartMember pm join
order_review..[OrgRoleVSFunction] rf on pm.PartID = rf.OrgRoleID
where pm.LoginID=  :userid 
`,  { replacements: { userid: ctx.state.user.data._id}, type: ctx.model.QueryTypes.SELECT })
    ctx.logger.debug(res)
    ctx.helper.success({ ctx, res: res[0].auth })
  }

  async listByShop() {
    const { ctx } = this
    const payload = ctx.request.body
    const fs = await ctx.model.query(`
SELECT  *
FROM    (
SELECT ROW_NUMBER() OVER ( ORDER BY p.EditDate ) AS RowNum,p.SheetID, p.ShopID, p.ManageDeptID, p.AskType, p.Flag, p.Editor, p.EditDate, p.Operator, p.Checker, p.CheckDate, 
                p.Notes, p.PrintCount, s.Name AS ShopName
FROM      mySHOPSHStock.dbo.PurchaseAsk0 AS p LEFT OUTER JOIN
                mySHOPSHStock.dbo.Shop AS s ON p.ShopID = s.ID
WHERE   (p.ShopId = :shopid)) as resultRows
WHERE   RowNum between :index and :count
ORDER BY RowNum
`,  { replacements: { shopid: payload.shopid, index: (payload.curpage - 1) * payload.pagesize + 1, count: (payload.curpage) * payload.pagesize}, type: ctx.model.QueryTypes.SELECT })
    const rs = await ctx.model.query(`
    	SELECT count(1) as value FROM mySHOPSHStock.dbo.PurchaseAsk0 AS p
where p.ShopID=:shopid`,  { replacements: { shopid: payload.shopid }, type: ctx.model.QueryTypes.SELECT })
    const res = { fs, total: rs[0].value }
    ctx.logger.debug('res'+JSON.stringify(res))
    // 设置响应内容和响应状态码
    ctx.helper.success({ctx, res})
  }

async itemReason() {
    const { ctx } = this
    const payload = ctx.request.body
    const reasons = await ctx.model.query(`SELECT   SheetID, GoodsID, reason
FROM      (SELECT   SheetID, GoodsID, dbo.F_CheckPurchaseItem(SheetID, GoodsID, :userid) AS reason
                 FROM      mySHOPSHStock.dbo.PurchaseAskItem0
                 WHERE   (SheetID IN (:sheetids))) AS results
WHERE   (LEN(reason) > 0)
`,  { replacements: { sheetids: payload.sheetids, userid: ctx.state.user.data._id }, type: ctx.model.QueryTypes.SELECT })
     
    const res = reasons
    // 设置响应内容和响应状态码
    ctx.helper.success({ctx, res})
  }

  

  async itemBySheetIds() {
    const { ctx } = this
    const payload = ctx.request.body
    const itemsp = ctx.model.query(`SELECT i.*,g.Name goodsname, order_review.dbo.F_CheckPurchaseItem(SheetID,i.GoodsID,:userid) reason
FROM      mySHOPSHStock.dbo.PurchaseAskItem0 i left join mySHOPSHStock..Goods g on g.GoodsID = i.GoodsID
WHERE   (SheetID IN (:sheetids)) order by serialid
`,  { replacements: { sheetids: payload.sheetids, userid: ctx.state.user.data._id }, type: ctx.model.QueryTypes.SELECT })
    const logsp = ctx.model.query(`SELECT  l.*,u.Name LogUser FROM      order_review.dbo.[PurchaseControlItemLogs] l left JOIN
        mySHOPSHConnect.dbo.Login  u on l.LogUserID = u.LoginID
WHERE   (SheetID IN (:sheetids)) order by LogTime
`,  { replacements: { sheetids: payload.sheetids }, type: ctx.model.QueryTypes.SELECT })
    const p2 = await Promise.all([itemsp, logsp])
    const res = p2
    // 设置响应内容和响应状态码
    ctx.helper.success({ctx, res})
  }
 
  async check() {
    const { ctx } = this
    const { sheetid } = ctx.request.body
    const userid = 1 // ctx.state.user.data._id
    const fs = await ctx.model.query(`DECLARE @return_value int
EXEC  @return_value = [mySHOPSHStock].[dbo].[ST_PurchaseAsk]
    @SheetID = :sheetid,
    @Checker = :userid
SELECT  'result' = @return_value`,  { replacements: { sheetid, userid } })
    const res = fs
    ctx.logger.debug(res)
    // 设置响应内容和响应状态码
    ctx.helper.success({ctx, res})
  }

}
module.exports = PurchaseController