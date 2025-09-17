import { PagerMeta } from './pager';

///NEW///
export type RolesState = {
  isLoading: boolean;
  error: Error | string | null;
  roles: Role[];
  meta: PagerMeta;
  query: object;
};

export type Role = {
  id: number;
  name: string;
  description: string;
  createdAt: Date | string | number;
};

export interface IRoleRequestList {
  data: Role[];
  meta: {
    page: number;
    limit: number;
    totalCount: number;
    pageCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}
