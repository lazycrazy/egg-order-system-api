const Controller = require('egg').Controller

class PurchaseController extends Controller {
  constructor(ctx) {
    super(ctx)
  } 

  async reject() {
    const { ctx } = this
    const payload = ctx.request.body || {}     
    const usql = `UPDATE ${this.config.DBStock}.[dbo].[PurchaseAsk0]
   SET Flag = 99   WHERE  
      [SheetID] = :sheetid
`
    const res = await ctx.model.query(usql,  {replacements: { sheetid: payload.sheetid }, type: ctx.model.QueryTypes.UPDATE })
    ctx.helper.success({ ctx, res }) 
  }

   async updateItemAndLog() {
    const { ctx } = this
    const payload = ctx.request.body || {}
    const isql = ` 
INSERT INTO ${this.config.DBOrderReview}.[dbo].[PurchaseControlItemLogs]
           ([LogTime]
           ,[LogUserID]
           ,[LogDesc]
           ,[SheetID]
           ,[serialid]
           ,[GoodsID]
           ,[PKNum]
           ,[Qty]
           ,[PKName]
           ,[PKSpec]
           ,[BarcodeID]
           ,[Cost]
           ,[Price]
           ,[StockQty]
           ,[SaleDate]
           ,[ReceiptDate]
           ,[PromotionType]
           ,[NewFlag]
           ,[Notes]
           ,[MonthSaleQty]
           ,[LastWeekSaleQty]
           ,[KSDays]
           ,[InputGoodsId]
           ,[OrdDay]
           ,[MakeUpInterval]
           ,[DeliverDay]
           ,[AdviceQty]
           ,[SSQ]
           ,[retdcflag]
           ,[DeliveryAddr]
           ,[SafeInventoryDay]
           ,[COV]
           ,[CanSaleQty]
           ,[OpenTransQty]
           ,[LastyearSaleQty]
           ,[MakeupDays]
           ,[LastTotalSaleQty]) 
           select getdate(),:userid,:desc,[SheetID]
           ,[serialid]
           ,[GoodsID]
           ,[PKNum]
           ,[Qty]
           ,[PKName]
           ,[PKSpec]
           ,[BarcodeID]
           ,[Cost]
           ,[Price]
           ,[StockQty]
           ,[SaleDate]
           ,[ReceiptDate]
           ,[PromotionType]
           ,[NewFlag]
           ,[Notes]
           ,[MonthSaleQty]
           ,[LastWeekSaleQty]
           ,[KSDays]
           ,[InputGoodsId]
           ,[OrdDay]
           ,[MakeUpInterval]
           ,[DeliverDay]
           ,[AdviceQty]
           ,[SSQ]
           ,[retdcflag]
           ,[DeliveryAddr]
           ,[SafeInventoryDay]
           ,[COV]
           ,[CanSaleQty]
           ,[OpenTransQty]
           ,[LastyearSaleQty]
           ,[MakeupDays]
           ,[LastTotalSaleQty] from
           ${this.config.DBStock}..PurchaseAskItem0 i
           where
           SheetID=:sheetid and GoodsID = :goodsid
`
    const usql = `UPDATE ${this.config.DBStock}.[dbo].[PurchaseAskItem0]
   SET [Qty] = :qty 
   WHERE  
      [SheetID] = :sheetid
      and 
      [GoodsID] = :goodsid
`
    return ctx.model.transaction(async function (t) {
            const ires = await ctx.model.query(isql,  { transaction: t, replacements: { userid: ctx.state.user.data._id, desc: payload.desc, sheetid: payload.sheetid, goodsid: payload.goodsid }, type: ctx.model.QueryTypes.INSERT })
            const ures = await ctx.model.query(usql,  { transaction: t, replacements: { userid: ctx.state.user.data._id, desc: payload.desc, sheetid: payload.sheetid, goodsid: payload.goodsid, qty: payload.qty }, type: ctx.model.QueryTypes.UPDATE })
            const res = [ires, ures] 
            ctx.logger.debug('res - ' + res)
        return  res 
        }).then(function (result) {
          // Transaction has been committed
          // result is whatever the result of the promise chain returned to the transaction callback
            ctx.helper.success({ctx, res: result})  
        }).catch(function (err) {
          // Transaction has been rolled back
          // err is whatever rejected the promise chain returned to the transaction callback
          throw err
        });

  }

  async deleteItemAndLog() {
    const { ctx } = this
    const payload = ctx.request.body || {}
    const isql = ` 
INSERT INTO ${this.config.DBOrderReview}.[dbo].[PurchaseControlItemLogs]
           ([LogTime]
           ,[LogUserID]
           ,[LogDesc]
           ,[SheetID]
           ,[serialid]
           ,[GoodsID]
           ,[PKNum]
           ,[Qty]
           ,[PKName]
           ,[PKSpec]
           ,[BarcodeID]
           ,[Cost]
           ,[Price]
           ,[StockQty]
           ,[SaleDate]
           ,[ReceiptDate]
           ,[PromotionType]
           ,[NewFlag]
           ,[Notes]
           ,[MonthSaleQty]
           ,[LastWeekSaleQty]
           ,[KSDays]
           ,[InputGoodsId]
           ,[OrdDay]
           ,[MakeUpInterval]
           ,[DeliverDay]
           ,[AdviceQty]
           ,[SSQ]
           ,[retdcflag]
           ,[DeliveryAddr]
           ,[SafeInventoryDay]
           ,[COV]
           ,[CanSaleQty]
           ,[OpenTransQty]
           ,[LastyearSaleQty]
           ,[MakeupDays]
           ,[LastTotalSaleQty]) 
           select getdate(),:userid,:desc,[SheetID]
           ,[serialid]
           ,[GoodsID]
           ,[PKNum]
           ,[Qty]
           ,[PKName]
           ,[PKSpec]
           ,[BarcodeID]
           ,[Cost]
           ,[Price]
           ,[StockQty]
           ,[SaleDate]
           ,[ReceiptDate]
           ,[PromotionType]
           ,[NewFlag]
           ,[Notes]
           ,[MonthSaleQty]
           ,[LastWeekSaleQty]
           ,[KSDays]
           ,[InputGoodsId]
           ,[OrdDay]
           ,[MakeUpInterval]
           ,[DeliverDay]
           ,[AdviceQty]
           ,[SSQ]
           ,[retdcflag]
           ,[DeliveryAddr]
           ,[SafeInventoryDay]
           ,[COV]
           ,[CanSaleQty]
           ,[OpenTransQty]
           ,[LastyearSaleQty]
           ,[MakeupDays]
           ,[LastTotalSaleQty] from
           ${this.config.DBStock}..PurchaseAskItem0 i
           where
           SheetID=:sheetid and GoodsID = :goodsid
`
    const dsql = `delete from ${this.config.DBStock}.[dbo].[PurchaseAskItem0]
   WHERE  
      [SheetID] = :sheetid
      and 
      [GoodsID] = :goodsid
`
    return ctx.model.transaction(async function (t) {
            const ires = await ctx.model.query(isql,  { transaction: t, replacements: { userid: ctx.state.user.data._id, desc: payload.desc, sheetid: payload.sheetid, goodsid: payload.goodsid }, type: ctx.model.QueryTypes.INSERT })
            const dres = await ctx.model.query(dsql,  { transaction: t, replacements: { userid: ctx.state.user.data._id, desc: payload.desc, sheetid: payload.sheetid, goodsid: payload.goodsid }, type: ctx.model.QueryTypes.DELETE })
            const res = [ires, dres] 
            ctx.logger.debug('res - ' + res)
        return  res 
        }).then(function (result) {
          // Transaction has been committed
          // result is whatever the result of the promise chain returned to the transaction callback
            ctx.helper.success({ctx, res: result})  
        }).catch(function (err) {
          // Transaction has been rolled back
          // err is whatever rejected the promise chain returned to the transaction callback
          throw err
        });

  }

  async sheetLog() {
    const { ctx } = this
    const payload = ctx.request.body || {}
    const res = await ctx.model.query(`INSERT INTO ${this.config.DBOrderReview}.[dbo].[PurchaseControlItemLogs]
           ([LogTime]
           ,[LogUserID]
           ,[LogDesc]
           ,[SheetID]
           ,[serialid])
     VALUES
           (getdate(),:userid,:desc,:sheetid,:auth)
`,  { replacements: { userid: ctx.state.user.data._id, 
    desc: payload.desc, 
    sheetid: payload.sheetid, 
    auth: payload.auth 
  }, type: ctx.model.QueryTypes.INSERT })
    ctx.logger.debug(res)
    ctx.helper.success({ ctx, res })
  }

  async reviewAuth() {
    const { ctx } = this
    const res = await ctx.model.query(`
select isnull(max(rf.FunctionId ),0) auth 
from ${this.config.DBConnect}..PartMember pm join
${this.config.DBOrderReview}..[OrgRoleVSFunction] rf on pm.PartID = rf.OrgRoleID
where pm.LoginID=  :userid 
`,  { replacements: { userid: ctx.state.user.data._id}, type: ctx.model.QueryTypes.SELECT })
    ctx.logger.debug(res)
    ctx.helper.success({ ctx, res: res[0].auth })
  }

  async listByShop() {
    const { ctx } = this
    const payload = ctx.request.body
    const auth = payload.auth
    if(auth < 1)
      throw new Error('没有审批权限') 
    let cdi = ` and exists (select 1 from ${this.config.DBOrderReview}.[dbo].[PurchaseControlItemLogs] l where 
             l.SheetID = p.sheetid and l.serialid = -12) ` 
    if(auth === 1)
      cdi = ` and not exists (select 1 from ${this.config.DBOrderReview}.[dbo].[PurchaseControlItemLogs] l where 
             l.SheetID = p.sheetid and l.serialid = -11) `
    else if(auth === 2)
      cdi = ` and exists (select 1 from ${this.config.DBOrderReview}.[dbo].[PurchaseControlItemLogs] l where 
             l.SheetID = p.sheetid and l.serialid = -11)
              and not exists (select 1 from ${this.config.DBOrderReview}.[dbo].[PurchaseControlItemLogs] l where 
             l.SheetID = p.sheetid and l.serialid = -12)
              `
    let depts = ['']
    if(payload.depts && payload.depts.length > 0){
      depts = payload.depts
    } 
    if(payload.sheetid && payload.sheetid.trim().length > 0){
      cdi += " and p.sheetid = :sheetid "
    } 
    cdi += " and p.ManageDeptID in (:depts) "

    const fs = await ctx.model.query(`
SELECT  *
FROM    (
SELECT ROW_NUMBER() OVER ( ORDER BY p.EditDate ) AS RowNum,p.SheetID, p.ShopID, p.ManageDeptID, p.AskType, p.Flag, p.Editor, p.EditDate, p.Operator, p.Checker, p.CheckDate, 
                p.Notes, p.PrintCount, s.Name AS ShopName,sg.id kid,sg.name kname
FROM      ${this.config.DBStock}.dbo.PurchaseAsk0 AS p LEFT OUTER JOIN
                ${this.config.DBStock}.dbo.Shop AS s ON p.ShopID = s.ID LEFT OUTER JOIN
                ${this.config.DBStock}.dbo.SGroup AS sg on p.ManageDeptID = sg.id
WHERE  p.Flag<> 99 and (p.ShopId = :shopid) ${cdi} ) as resultRows
WHERE   RowNum between :index and :count
ORDER BY RowNum
`,  { replacements: { shopid: payload.shopid, depts, sheetid: payload.sheetid, index: (payload.curpage - 1) * payload.pagesize + 1, count: (payload.curpage) * payload.pagesize}, type: ctx.model.QueryTypes.SELECT })
    const rs = await ctx.model.query(`
    	SELECT count(1) as value FROM ${this.config.DBStock}.dbo.PurchaseAsk0 AS p
where p.Flag<> 99 and p.ShopID=:shopid ${cdi} `,  { replacements: { shopid: payload.shopid, depts, sheetid: payload.sheetid }, type: ctx.model.QueryTypes.SELECT })
    const res = { fs, total: rs[0].value }
    ctx.logger.debug('res'+JSON.stringify(res))
    // 设置响应内容和响应状态码
    ctx.helper.success({ctx, res})
  }

async itemReason() {
    const { ctx } = this
    const payload = ctx.request.body
    const reasons = await ctx.model.query(`SELECT   SheetID, GoodsID, reason
FROM      (SELECT   SheetID, GoodsID, dbo.F_CheckPurchaseItem(SheetID, GoodsID, :auth) AS reason
                 FROM      ${this.config.DBStock}.dbo.PurchaseAskItem0
                 WHERE   (SheetID IN (:sheetids))) AS results
WHERE   (LEN(reason) > 0)
`,  { replacements: { sheetids: payload.sheetids, auth: payload.auth }, type: ctx.model.QueryTypes.SELECT })
     
    const res = reasons
    // 设置响应内容和响应状态码
    ctx.helper.success({ctx, res})
  }

  

  async itemBySheetIds() {
    const { ctx } = this
    const payload = ctx.request.body
    const itemsp = ctx.model.query(`SELECT i.*,g.Name goodsname, ${this.config.DBOrderReview}.dbo.F_CheckPurchaseItem(SheetID,i.GoodsID,:auth) reason
FROM      ${this.config.DBStock}.dbo.PurchaseAskItem0 i left join ${this.config.DBStock}..Goods g on g.GoodsID = i.GoodsID
WHERE   (SheetID IN (:sheetids)) order by serialid
`,  { replacements: { sheetids: payload.sheetids, auth: payload.auth }, type: ctx.model.QueryTypes.SELECT })
    const logsp = ctx.model.query(`SELECT  l.*,u.Name LogUser FROM      ${this.config.DBOrderReview}.dbo.[PurchaseControlItemLogs] l left JOIN
        ${this.config.DBConnect}.dbo.Login  u on l.LogUserID = u.LoginID
WHERE   (SheetID IN (:sheetids)) order by LogTime
`,  { replacements: { sheetids: payload.sheetids }, type: ctx.model.QueryTypes.SELECT })
    const p2 = await Promise.all([itemsp, logsp])
    const res = p2
    // 设置响应内容和响应状态码
    ctx.helper.success({ctx, res})
  }
 
  async review() {
    const { ctx } = this
    const { sheetid } = ctx.request.body
    const userid = ctx.state.user.data._id
    const fs = await ctx.model.query(`DECLARE @return_value int
EXEC  @return_value = [${this.config.DBStock}].[dbo].[ST_PurchaseAsk]
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