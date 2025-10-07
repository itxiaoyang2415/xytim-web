import request from '@/utils/request'
import type { AdminRechargeDTO, AdminRechargeVO, RechargeRecordQuery, AdminRechargeRecordVO } from './types'

/**
 * 管理员为用户充值
 * @param data 充值参数
 * @returns 充值结果
 */
export function rechargeForUser(data: AdminRechargeDTO) {
  return request<AdminRechargeVO>({
    url: '/im/admin/wallet/recharge',
    method: 'post',
    data
  })
}

/**
 * 查询充值记录列表
 * @param params 查询参数
 * @returns 充值记录列表
 */
export function getRechargeRecords(params: RechargeRecordQuery) {
  return request<{
    rows: AdminRechargeRecordVO[]
    total: number
  }>({
    url: '/im/admin/wallet/recharge-records',
    method: 'get',
    params
  })
}
