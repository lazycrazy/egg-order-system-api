'use strict'

const Service = require('egg').Service

class UserAccessService extends Service {

  async login(payload) {
    const { ctx, service } = this
    const user = await service.user.findByName(payload.mobile)
    ctx.logger.debug('query user' + JSON.stringify(user));
    // ctx.logger.debug('hash' + await ctx.genHash('1234'));

    if(!user){
      ctx.throw(404, '用户不存在')
    }
    let verifyPsw = await ctx.compare(payload.password.trim(), await ctx.genHash(user.password.trim()))
    if(!verifyPsw) {
      ctx.throw(404, '用户密码错误')
    }
    // 生成Token令牌
    return { token: await service.actionToken.apply(user.LoginID) }
  }

  async logout() {
  }

  async resetPsw(values) {
    const { ctx, service } = this
    // ctx.state.user 可以提取到JWT编码的data
    const _id = ctx.state.user.data._id
    const user = await service.user.find(_id)
    if (!user) {
      ctx.throw(404, 'user is not found')
    }

    let verifyPsw = await ctx.compare(values.oldPassword.trim(), await ctx.genHash(user.password.trim())) 
    if (!verifyPsw) {
      ctx.throw(404, '用户密码错误')
    } else {
      // 重置密码
      //values.password = await ctx.genHash(values.password)
      return service.user.changePassword(_id, values.password)
    }
  }

  async current() {
    const { ctx, service } = this
    // ctx.state.user 可以提取到JWT编码的data
    const _id = ctx.state.user.data._id
    const user = await service.user.find(_id)
    if (!user) {
      ctx.throw(404, 'user is not found')
    }
    user.roles = [ user.IsAdmin? 'admin':'editor' ]
    user.password = 'How old are you?'
    ctx.logger.debug('user' + JSON.stringify( user))
    return user
  }

  // 修改个人信息
  async resetSelf(values) {
    const {ctx, service} = this
    // 获取当前用户
    const _id = ctx.state.user.data._id
    const user = await service.user.find(_id)
    if (!user) {
      ctx.throw(404, 'user is not found')
    }
    return service.user.findByIdAndUpdate(_id, values)
  }

  // 更新头像
  async resetAvatar(values) {
    const {ctx, service} = this
    await service.upload.create(values)
    // 获取当前用户
    const _id = ctx.state.user.data._id
    const user = await service.user.find(_id)
    if (!user) {
      ctx.throw(404, 'user is not found')
    }
    return service.user.findByIdAndUpdate(_id, {avatar: values.url})
  }

}

module.exports = UserAccessService
