import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { UserVO, UserBanDTO, UserUnbanDTO, UserQuery } from '@/api/im/user/types';

/**
 * 查询用户列表
 * @param query
 * @returns {*}
 */

export const listUser = (query?: UserQuery): AxiosPromise<UserVO[]> => {
  return request({
    url: '/im/user/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询用户详细
 * @param id
 */
export const getUser = (id: string | number): AxiosPromise<UserVO> => {
  return request({
    url: '/im/user/' + id,
    method: 'get'
  });
};


/**
 * 封禁用户
 * @param data
 */
export const ban = (data: UserBanDTO) => {
  return request({
    url: '/im/user/ban',
    method: 'put',
    data: data
  });
};


/**
 * 解封用户
 * @param data
 */
export const unban = (data: UserUnbanDTO) => {
  return request({
    url: '/im/user/unban',
    method: 'put',
    data: data
  });
};


export const findUserByName = (name?: String): AxiosPromise<UserVO[]> => {
  return request({
    url: '/im/user/findByName?name=' + name,
    method: 'get'
  });
};

/**
 * 按天统计用户注册数量
 * @param days 统计天数
 */
export const getDailyRegistrationCount = (days?: number): AxiosPromise<any[]> => {
  return request({
    url: '/im/user/dailyRegistrationCount',
    method: 'get',
    params: { days }
  });
};

/**
 * 获取总用户数量
 */
export const getTotalUserCount = (): AxiosPromise<number> => {
  return request({
    url: '/im/user/totalCount',
    method: 'get'
  });
};

/**
 * 获取活跃用户统计（日活、周活、月活）
 */
export const getActiveUserStats = (): AxiosPromise<any> => {
  return request({
    url: '/im/user/activeStats',
    method: 'get'
  });
};
