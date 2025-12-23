
export enum KeyStatus {
  ACTIVE = 'ACTIVE',
  REVOKED = 'REVOKED',
  EXPIRED = 'EXPIRED'
}

export enum KeyScope {
  READ = '只读权限',
  WRITE = '读写权限',
  ADMIN = '管理权限'
}

export interface Space {
  id: string;
  name: string;
  icon?: string;
}

export interface AppModel {
  id: string;
  spaceId: string;
  name: string;
}

export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  fullKey?: string; // 仅在创建成功后的瞬间存在
  status: KeyStatus;
  userId: string; // 关联权限用户 ID
  userName: string;
  creatorId: string; // 创建者 ID
  creatorName: string;
  createdAt: string;
  updaterId?: string; // 修改者 ID
  updaterName?: string;
  updatedAt?: string;
  lastUsedAt?: string; // 最后使用时间
  authorizedAppIds: string[]; // 授权应用，空数组代表“全部”
  scopes: KeyScope[];
  appId: string; 
  spaceId: string;
  expiresAt?: string; // 授权期限
  usageCount: number;
}
