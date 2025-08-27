import { PagerMeta } from './pager';

export type NotificationsState = {
  notifications: Notification[];
  isLoading: boolean;
  error: Error | string | null;
  meta: PagerMeta;
  query: object;
};

type Payload = {
  [key: string]: any;
};

export type Notification = {
  id?: string;
  type: string;
  createdAt: Date;
  message: string;
  title: string;
  isUnRead: boolean;
  data: Payload;
  avatar?: string;
};

export interface INotificationRequestList {
  data: Notification[];
  meta: {
    page: number;
    limit: number;
    totalCount: number;
    pageCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}
