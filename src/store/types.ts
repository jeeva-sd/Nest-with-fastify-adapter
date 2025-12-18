import { ClsStore } from 'nestjs-cls';
import { TokenData } from '~/common/types/request.type';
import { UserWithRolePermissions } from '~/modules/auth/auth.service';

export interface Store extends ClsStore {
    tenantId: string;
    reqUser: TokenData;
    impersonation: boolean;
    userToImpersonate?: UserWithRolePermissions;
    user: {
        id: number;
        authorized: boolean;
    };
}
