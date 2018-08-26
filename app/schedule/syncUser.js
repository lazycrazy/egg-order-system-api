module.exports = app => {
  return {
    schedule: {
      interval: '10m',
      type: 'worker'
    },
    async task(ctx) {
      await ctx.service.query.syncUser()
    },
  };
};