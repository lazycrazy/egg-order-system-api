module.exports = app => {
  return {
    schedule: {
      interval: '1m',
      type: 'worker',
      disable: app.config.IsHQ
    },
    async task(ctx) {
      await ctx.service.query.rejectToday()
    },
  };
};