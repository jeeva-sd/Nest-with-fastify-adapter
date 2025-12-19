import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { AckHandler } from '~/common';
import { PrismaService } from '~/services';
import { generalEvents } from '../../events/event.patterns';
import { RoleService } from '../../roles/role.service';
import { EcoAppsService } from '../eco-app.service';
import { DepartmentSyncDto } from '../schemas';

@Controller()
export class DepartmentSyncEvent {
    private readonly chalk = new Logger(DepartmentSyncEvent.name);

    constructor(
        private prismaService: PrismaService,
        private ecoAppService: EcoAppsService,
        private roleService: RoleService
    ) {}

    @EventPattern(generalEvents.ecoApps.departmentSync)
    @AckHandler(DepartmentSyncDto)
    async handleDepartmentSync(@Payload() payload: DepartmentSyncDto, @Ctx() _context: RmqContext) {
        const { userId, departmentInfo } = payload;

        if (!(departmentInfo && Array.isArray(departmentInfo))) {
            this.chalk.error(`Invalid departmentInfo for user ${userId}`);
            return;
        }

        // Step 1: Collect all supervisor IDs from the payload
        const allSupervisorIds = departmentInfo
            .flatMap(dep => dep.supervisorIds || [])
            .filter((id, i, arr) => id && arr.indexOf(id) === i); // Unique and defined

        // Step 2: Check which supervisors already exist in the database
        const existingSupervisors = await this.prismaService.user.findMany({
            where: { id: { in: allSupervisorIds } },
            select: { id: true }
        });
        const existingSupervisorIds = new Set(existingSupervisors.map(s => s.id));

        // Step 3: Identify missing supervisors
        const missingSupervisorIds = allSupervisorIds.filter(id => !existingSupervisorIds.has(id));

        // Step 4: Fetch missing supervisors from the EcoApps service
        let newSupervisors = [];
        if (missingSupervisorIds.length > 0) {
            const response = await this.ecoAppService.findUserById(missingSupervisorIds);
            newSupervisors = response.rows || [];
        }

        // Step 5: Create missing supervisors in the database
        if (newSupervisors.length > 0) {
            await this.prismaService.user.createMany({
                data: newSupervisors.map(user => ({
                    id: user.id,
                    fname: user.fname,
                    lname: user.lname,
                    email: user.email,
                    roleId: this.roleService.getRoleIdFromPortalRoleType(user.roleType),
                    status: user.status,
                    phone: user.phone,
                    country: user.country,
                    timezone: user.timezone,
                    bio: user.bio,
                    organizationId: user.organizationId,
                    profileImage: !!user.profileImage,

                    // Default user settings
                    userSettings: {
                        create: {
                            darkMode: false,
                            emailNotifications: true
                        }
                    }
                })),
                skipDuplicates: true
            });
        }

        // Step 6: Process all departments in parallel with better error handling
        const departmentPromises = departmentInfo.map(async dep => {
            try {
                const departmentId = dep.departmentId;
                const title = dep.title;

                // Step 6.1: Ensure the department exists or create it
                const userDepartment = await this.prismaService.userDepartment.upsert({
                    where: {
                        userId_departmentId: {
                            userId,
                            departmentId
                        }
                    },
                    create: {
                        userId,
                        departmentId,
                        title
                    },
                    update: {
                        title
                    }
                });

                // Step 6.2 & 6.3: Fetch existing relations and determine changes in parallel
                const [existingRelations] = await Promise.all([
                    this.prismaService.userDeptSupervisor.findMany({
                        where: { userDepartmentId: userDepartment.id },
                        select: { supervisorId: true }
                    })
                ]);

                const existingSupervisorIdsInDepartment = new Set(existingRelations.map(rel => rel.supervisorId));
                const supervisorsToAdd = (dep.supervisorIds || []).filter(
                    id => !existingSupervisorIdsInDepartment.has(id)
                );
                const supervisorsToRemove = Array.from(existingSupervisorIdsInDepartment).filter(
                    id => !(dep.supervisorIds || []).includes(id)
                );

                // Step 6.4 & 6.5: Execute remove and add operations in parallel
                await Promise.all([
                    // Remove old supervisor relations
                    supervisorsToRemove.length > 0
                        ? this.prismaService.userDeptSupervisor.deleteMany({
                              where: {
                                  userDepartmentId: userDepartment.id,
                                  supervisorId: { in: supervisorsToRemove }
                              }
                          })
                        : Promise.resolve(),
                    // Add new supervisor relations
                    supervisorsToAdd.length > 0
                        ? this.prismaService.userDeptSupervisor.createMany({
                              data: supervisorsToAdd.map(supId => ({
                                  userDepartmentId: userDepartment.id,
                                  supervisorId: supId
                              }))
                          })
                        : Promise.resolve()
                ]);
            } catch (error) {
                this.chalk.error(`Error processing department ${dep.departmentId} for user ${userId}:`, error);
                // Continue processing other departments
            }
        });

        // Wait for all department operations to complete
        await Promise.allSettled(departmentPromises);

        this.chalk.log(`Department sync completed for user ${userId}`);
    }
}
