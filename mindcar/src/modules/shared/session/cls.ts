import { ClsStore } from 'nestjs-cls';
import { MCSession } from './session';

export interface SessionClsStore extends ClsStore {
  session: MCSession;
}
