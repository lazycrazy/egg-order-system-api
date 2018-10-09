module.exports = app => {
  return {
    schedule: {
      interval: '1h',
      type: 'worker',
      disable: true //app.config.IsHQ
    },
    async task(ctx) {
		const shopid = await ctx.service.query.curShopId()

		const res = await ctx.curl(app.config.HQServerUrl + '/api/query/master', {
	    contentType: 'json',
	    method: 'POST',
	    data: {
	      shopid,
	      entity: 'OrderControl',
	    },
	    // 明确告诉 HttpClient 以 JSON 格式处理返回的响应 body
	    dataType: 'json',
	    });
        app.logger.debug('syncOrderControl - ' + JSON.stringify(res.data.data.length)) 
        await ctx.service.query.syncOrderControl(res.data.data)
    },
  };
};