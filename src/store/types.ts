import { ClsStore } from 'nestjs-cls';
import { TokenUser } from '../common/types';

export interface Store extends ClsStore {
    tenantId: string;
    reqUser: TokenUser;
    user: {
        id: number;
        authorized: boolean;
    };
}
