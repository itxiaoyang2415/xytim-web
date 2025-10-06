import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { CompanyVO, CompanyForm, CompanyQuery, CompanyBindDTO } from '@/api/im/company/types';

/**
 * 查询企业信息列表
 * @param query
 * @returns {*}
 */

export const listCompany = (query?: CompanyQuery): AxiosPromise<CompanyVO[]> => {
  return request({
    url: '/im/company/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询企业信息详细
 * @param id
 */
export const getCompany = (id: string | number): AxiosPromise<CompanyVO> => {
  return request({
    url: '/im/company/' + id,
    method: 'get'
  });
};

/**
 * 新增企业信息
 * @param data
 */
export const addCompany = (data: CompanyForm) => {
  return request({
    url: '/im/company',
    method: 'post',
    data: data
  });
};

/**
 * 修改企业信息
 * @param data
 */
export const updateCompany = (data: CompanyForm) => {
  return request({
    url: '/im/company',
    method: 'put',
    data: data
  });
};

/**
 * 删除企业信息
 * @param id
 */
export const delCompany = (id: string | number | Array<string | number>) => {
  return request({
    url: '/im/company/' + id,
    method: 'delete'
  });
};

/**
 * 企业添加员工
 * @param data
 */
export const bindEmployee = (data: CompanyBindDTO) => {
  return request({
    url: '/im/company/bind',
    method: 'post',
    data: data
  });
};


/**
 * 企业移除员工
 * @param data
 */
export const unbindEmployee = (data: CompanyBindDTO) => {
  return request({
    url: '/im/company/unbind',
    method: 'delete',
    data: data
  });
};



