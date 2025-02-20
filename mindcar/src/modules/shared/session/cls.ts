import { ClsStore } from 'nestjs-cls';

export interface SessionClsStore extends ClsStore {
  session: Session;
}
