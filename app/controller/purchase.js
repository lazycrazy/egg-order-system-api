const Controller = require('egg').Controller

class PurchaseController extends Controller {
  constructor(ctx) {
    super(ctx)
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
    	SELECT count(1) FROM mySHOPSHStock.dbo.PurchaseAsk0 AS p
where p.ShopID=:shopid`,  { replacements: { shopid: payload.shopid }, type: ctx.model.QueryTypes.SELECT })
    ctx.logger.debug('fs:'+JSON.stringify(fs))
    ctx.logger.debug('rs'+JSON.stringify(rs))
    const res = { fs, total: rs[0].value }
    // 设置响应内容和响应状态码
    ctx.helper.success({ctx, res})
  }

  async itemByIds() {
    const { ctx } = this
    const payload = ctx.request.body
    const fs = await ctx.model.query(`SELECT   SheetID, serialid, GoodsID, PKNum, Qty, PKName, PKSpec, BarcodeID, Cost, Price, StockQty, SaleDate, ReceiptDate, 
                PromotionType, NewFlag, Notes, MonthSaleQty, LastWeekSaleQty, KSDays, InputGoodsId, OrdDay, MakeUpInterval, 
                DeliverDay, AdviceQty, SSQ, retdcflag, DeliveryAddr, SafeInventoryDay, COV, CanSaleQty, OpenTransQty, 
                LastyearSaleQty, MakeupDays, LastTotalSaleQty,order_review.dbo.F_CheckPurchaseItem(SheetID,GoodsID,:userid) reason
FROM      mySHOPSHStock.dbo.PurchaseAskItem0
WHERE   (SheetID IN (:sheetids)) order by serialid
`,  { replacements: { sheetids: payload.sheetids, userid: ctx.state.user.data._id }, type: ctx.model.QueryTypes.SELECT })
    const res = fs
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