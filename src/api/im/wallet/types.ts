/**
 * 钱包管理相关类型定义
 */

// 充值请求参数
export interface AdminRechargeDTO {
  userId: number          // 用户ID（必填）
  amount: number          // 充值金额（必填，最小0.01，最大100000）
  currency?: string       // 币种（选填，默认 USDT）
  remark?: string         // 充值备注（选填，最大200字符）
}

// 充值响应数据
export interface AdminRechargeVO {
  orderNo: string         // 订单号
  userId: number          // 用户ID
  userName: string        // 用户名
  nickName: string        // 用户昵称
  amount: number          // 充值金额
  currency: string        // 币种
  beforeBalance: number   // 充值前余额
  afterBalance: number    // 充值后余额
  remark: string          // 备注
  rechargeTime: string    // 充值时间 (yyyy-MM-dd HH:mm:ss)
}

// 充值记录查询参数
export interface RechargeRecordQuery {
  // 查询条件
  userId?: number         // 用户ID（选填）
  userName?: string       // 用户名/昵称（选填）
  startTime?: string      // 开始时间（选填）
  endTime?: string        // 结束时间（选填）
  minAmount?: number      // 最小金额（选填）
  maxAmount?: number      // 最大金额（选填）
  channel?: string        // 支付渠道（选填）
  status?: number         // 订单状态（选填）
  
  // 分页参数
  pageNum: number         // 页码（必填，默认1）
  pageSize: number        // 每页条数（必填，默认10）
}

// 充值记录响应数据
export interface AdminRechargeRecordVO {
  id: number              // 记录ID
  orderNo: string         // 订单号
  userId: number          // 用户ID
  userName: string        // 用户名
  nickName: string        // 用户昵称
  amount: number          // 充值金额
  currency: string        // 币种
  channel: string         // 充值渠道
  channelName: string     // 渠道名称（中文）
  status: number          // 状态
  statusName: string      // 状态名称（中文）
  beforeBalance: number   // 充值前余额
  afterBalance: number    // 充值后余额
  remark: string          // 备注
  completedTime: string   // 完成时间 (yyyy-MM-dd HH:mm:ss)
  createdAt: string       // 创建时间 (yyyy-MM-dd HH:mm:ss)
}

// 订单状态枚举
export enum OrderStatus {
  PENDING = 0,    // 待支付
  COMPLETED = 1,  // 已完成
  CANCELLED = 2,  // 已取消
  REFUNDED = 3    // 已退款
}

// 支付渠道枚举
export enum PaymentChannel {
  ADMIN = 'ADMIN',    // 后台充值
  ALIPAY = 'ALIPAY',  // 支付宝
  WECHAT = 'WECHAT',  // 微信支付
  BANK = 'BANK'       // 银行转账
}
