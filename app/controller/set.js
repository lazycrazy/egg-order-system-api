const Controller = require('egg').Controller

class SetController extends Controller {
  constructor(ctx) {
    super(ctx)
  }

  async functionSettingNew() {
    const { ctx } = this
    const obj = ctx.request.body || {}
    const isql = `INSERT INTO order_review.dbo.FunctionSetting
                (FunctionId, ShopId, GoodsId, DeptId, ordermultiple, OrderNum, OrderAmt, DayUpperlimit, DayUpperlimitAmt, 
                LastModifyDT)
SELECT :functionid, :shopid, GoodsID, DeptID, :ordermultiple, :ordernum, 
                :orderamt, :dayupperlimit, :dayupperlimitamt, GETDATE()  
FROM      mySHOPSHStock.dbo.Goods
WHERE   (GoodsID IN (:gids))`
    const usql = `update order_review.dbo.[FunctionSetting]
   SET [ordermultiple] = :ordermultiple
      ,[OrderNum] = :ordernum
      ,[OrderAmt] = :orderamt
      ,[DayUpperlimit] = :dayupperlimit
      ,[DayUpperlimitAmt] = :dayupperlimitamt
      ,[LastModifyDT] = getdate()
 WHERE ShopId=:shopid and FunctionId=:functionid and GoodsId in (:gids)`

    return ctx.model.transaction(async function (t) {
          let promises = []
          for( let i of obj.uids){
            const sql = usql
            const type = ctx.model.QueryTypes.UPDATE;
            let newPromise = ctx.model.query(sql, { transaction: t, replacements: {
            shopid: obj.shopid, 
            functionid: obj.functionid, 
            gids: i, 
            ordermultiple: obj.multiple,
            ordernum: obj.num, 
            orderamt: obj.amt, 
            dayupperlimit: obj.limitnum, 
            dayupperlimitamt: obj.limitamt
          }, type})
            promises.push(newPromise)         
          }
        const ures = await Promise.all(promises)   
        ctx.logger.debug('ures - ' + ures)
        promises = []
        for( let i of obj.iids){
          const sql = isql
          const type = ctx.model.QueryTypes.INSERT;
          let newPromise = ctx.model.query(sql, { transaction: t, replacements: {
          shopid: obj.shopid, 
          functionid: obj.functionid, 
          gids: i, 
          ordermultiple: obj.multiple,
          ordernum: obj.num, 
          orderamt: obj.amt, 
          dayupperlimit: obj.limitnum, 
          dayupperlimitamt: obj.limitamt
        }, type})
          promises.push(newPromise)         
      }
      const ires = await Promise.all(promises) 
      ctx.logger.debug('ires - ' + ires)

      return [ures, ires] 
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
 
  async functionSetting() {
  	const { ctx } = this
    const obj = ctx.request.body || {}
    const isql = `insert into order_review.dbo.[FunctionSetting]
           ([FunctionId]
           ,[ShopId]
           ,[GoodsId]
           ,[DeptId]
           ,[ordermultiple]
           ,[OrderNum]
           ,[OrderAmt]
           ,[DayUpperlimit]
           ,[DayUpperlimitAmt]
           ,[LastModifyDT]) 
    values(:functionid,
           :shopid,
           :goodsid,
           :deptId,
           :ordermultiple,
           :ordernum,
           :orderamt,
           :dayupperlimit,
           :dayupperlimitamt,
           getdate())`
    const usql = `update order_review.dbo.[FunctionSetting]
   SET [DeptId] = :deptId
      ,[ordermultiple] = :ordermultiple
      ,[OrderNum] = :ordernum
      ,[OrderAmt] = :orderamt
      ,[DayUpperlimit] = :dayupperlimit
      ,[DayUpperlimitAmt] = :dayupperlimitamt
      ,[LastModifyDT] = getdate()
 WHERE ShopId=:shopid and FunctionId=:functionid and GoodsId=:goodsid`
    // ctx.logger.debug('payload - ' + JSON.stringify(payload))

    return ctx.model.transaction(async function (t) {
  	    let promises = []
        for( let i of obj.goods){
			    const sql = i[0] === 0 ? isql : usql;
  				const type = i[0] === 0 ? ctx.model.QueryTypes.INSERT : ctx.model.QueryTypes.UPDATE;
  				let newPromise = ctx.model.query(sql, { transaction: t, replacements: {
          shopid: obj.shopid, 
          functionid: obj.functionid, 
          goodsid: i[1], 
          deptId: i[2], 
          ordermultiple: obj.ordermultiple,
          ordernum: obj.ordernum, 
          orderamt: obj.orderamt, 
          dayupperlimit: obj.dayupperlimit, 
          dayupperlimitamt: obj.dayupperlimitamt
        }, type})
	    		promises.push(newPromise)	    		
			}
			const res = await Promise.all(promises)   
    		ctx.logger.debug('res - ' + res)
    		return 	res	
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
 

  async rolePermission() {
    const { ctx } = this

    const payload = ctx.request.body || {}
    let sql = payload.isnew ? `insert into order_review.dbo.OrgRoleVSFunction(OrgRoleID,FunctionId) 
    values (:roleid,:functionid)` : `update order_review.dbo.OrgRoleVSFunction set FunctionId=:functionid
    where OrgRoleID=:roleid and FunctionId=:auth_bak`
    const type = payload.isnew ? ctx.model.QueryTypes.INSERT : ctx.model.QueryTypes.UPDATE
    const res = await ctx.model.query(sql,  { replacements: {roleid: payload.roleid, functionid: payload.auth, auth_bak: payload.auth_bak}, type})
    ctx.logger.debug('execute result ： ' + JSON.stringify(res))

    // 设置响应内容和响应状态码
    ctx.helper.success({ctx, res})
  }



  async orderProperty() {
    const { ctx } = this

    const payload = ctx.request.body || {}
    let sql = payload.isnew ? `insert into order_review.dbo.OrderControl(typeid,code,forbidden) 
    values (:typeid,:code,:forbidden)` : `update order_review.dbo.OrderControl set forbidden=:forbidden, LastModifyDT=getdate() 
    where typeid=:typeid and code=:code`
    const type = payload.isnew ? ctx.model.QueryTypes.INSERT : ctx.model.QueryTypes.UPDATE
    const res = await ctx.model.query(sql,  { replacements: {typeid: payload.type, code: payload.id, forbidden: !payload.allowOrder}, type})
    ctx.logger.debug('execute result ： ' + JSON.stringify(res))

    // 设置响应内容和响应状态码
    ctx.helper.success({ctx, res})
  }


}
module.exports = SetController