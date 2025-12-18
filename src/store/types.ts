import { ClsStore } from 'nestjs-cls';
import { TokenData } from '~/common/types/request.type';

export interface Store extends ClsStore {
    tenantId: string;
    reqUser: TokenData;
}
