export interface CompanyVO {
  /**
   * id
   */
  id: number;

  /**
   * 企业名称
   */
  name: string;

  /**
   * 统一社会信用代码
   */
  code: string;

  /**
   * 营业执照
   */
  license: string;

  /**
   * 业务范围
   */
  bizScope: string;

  /**
   * 联系人姓名
   */
  contactPerson: string;

  /**
   * 联系电话
   */
  contactPhone: string;

  /**
   * 删除标识  0：正常   1：已删除
   */
  deleted: number;

  /**
   * 创建者
   */
  creator: number;

}

export interface CompanyForm extends BaseEntity {
  /**
   * id
   */
  id?: string | number;

  /**
   * 企业名称
   */
  name?: string;

  /**
   * 统一社会信用代码
   */
  code?: string;

  /**
   * 营业执照
   */
  license?: string;

  /**
   * 业务范围
   */
  bizScope?: string;

  /**
   * 联系人姓名
   */
  contactPerson?: string;

  /**
   * 联系电话
   */
  contactPhone?: string;

  /**
   * 删除标识  0：正常   1：已删除
   */
  deleted?: number;

  /**
   * 创建者
   */
  creator?: number;

}

export interface CompanyQuery extends PageQuery {

  /**
   * 企业名称
   */
  name?: string;

  /**
   * 统一社会信用代码
   */
  code?: string;

}


export interface CompanyBindDTO {
  /**
   * 企业id
   */
  id?: string | number;

  /**
   * 用户id
   */
  userIds: Array<string | number>

}


