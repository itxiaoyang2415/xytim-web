export interface UserVO {
  /**
   * id
   */
  id: string | number;

  /**
   * 用户名
   */
  userName: string;

  /**
   * 用户昵称
   */
  nickName: string;

  /**
   * 用户头像
   */
  headImage: string;

  /**
   * 用户头像Url
   */
  headImageUrl: string;
  /**
   * 用户头像缩略图
   */
  headImageThumb: string;

  /**
   * 密码(明文)
   */
  password: string;

  /**
   * 性别 0:男 1::女
   */
  sex: number;

  /**
   * 个性签名
   */
  signature: string;

  /**
   * 企业id
   */ 
  companyId: string | number;

    /**
   * 企业名称
   */ 
  companyName: string;

  /**
   * 最后登录时间
   */
  lastLoginTime: string;

  /**
   * 创建时间
   */
  createdTime: string;

  /**
   * 
   */
  type: number;

  /**
   * 是否被封禁 0:否 1:是
   */
  isBanned: number;

  /**
   * 被封禁原因
   */
  reason: string;

  /**
   * 客户端id,用于uni-push推送
   */
  cid: string | number;

  /**
   * 状态 0：正常   1:已注销
   */
  status: number;

  /**
   * 钱包余额
   */
  walletBalance?: number;

  /**
   * 最后登录IP
   */
  lastLoginIp?: string;

}

export interface UserForm extends BaseEntity {
  /**
   * id
   */
  id?: string | number;

  /**
   * 用户名
   */
  userName?: string;

  /**
   * 用户昵称
   */
  nickName?: string;

  /**
   * 用户头像
   */
  headImage?: string;

  /**
   * 用户头像缩略图
   */
  headImageThumb?: string;

  /**
   * 密码(明文)
   */
  password?: string;

  /**
   * 性别 0:男 1::女
   */
  sex?: number;

  /**
   * 手机号码
   */
  phone: string,

  /**
   * 邮箱
   */
  email: string,

  /**
   * 个性签名
   */
  signature?: string;

  /**
   * 最后登录时间
   */
  lastLoginTime?: string;

  /**
   * 创建时间
   */
  createdTime?: string;

  /**
   * 
   */
  type?: number;

  /**
   * 是否被封禁 0:否 1:是
   */
  isBanned?: number;

  /**
   * 被封禁原因
   */
  reason?: string;

  /**
   * 客户端id,用于uni-push推送
   */
  cid?: string | number;

  /**
   * 状态 0：正常   1:已注销
   */
  status?: number;

}

export interface UserQuery extends PageQuery {
  /**
   * 用户id
   */
  id?: number;
  /**
   * 用户名
   */
  userName?: string;

  /**
   * 用户昵称
   */
  nickName?: string;
  /**
   * 创建时间
   */
  createdTime?: string;
  /**
   * 登陆ip
   */
  lastLoginIp: string;
  /**
   * 归属企业id
   */
  companyId: number;
  /**
  * 日期范围参数
  */
  params?: any;
}

export interface UserBanDTO {

  /**
   * id
   */
  id?: string | number;

  /**
   * 被封禁原因
   */
  reason?: string;
}


export interface UserUnbanDTO {

  /**
   * id
   */
  id?: string | number;
}


