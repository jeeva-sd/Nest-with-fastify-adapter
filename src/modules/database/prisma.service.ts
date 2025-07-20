import { Injectable, OnApplicationBootstrap, OnModuleDestroy } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { Chalk } from '~/common';
import { appConfig } from '~/configs';
import { seedDatabase } from './seed';

const { sql } = appConfig.database;

if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = `mysql://${sql.username}:${sql.password}@${sql.host}:${sql.port}/${sql.database}?connection_limit=${sql.connectionLimit}&pool_timeout=${sql.performance.poolTimeout}&socket_timeout=${sql.performance.socketTimeout}&connect_timeout=${sql.performance.connectTimeout}&sslmode=PREFERRED&query_timeout=${sql.performance.queryTimeout}`;
}

@Injectable()
export class PrismaService extends PrismaClient implements OnApplicationBootstrap, OnModuleDestroy {
    private readonly chalk = new Chalk('PrismaService');
    private static isSeeded = false;
    private static isConnected = false;

    constructor() {
        super({
            datasources: {
                db: {
                    url: process.env.DATABASE_URL // Use optimized connection string with performance parameters
                }
            },
            log: [
                // Environment-aware logging configuration
                ...(appConfig.server.mode === 'development'
                    ? [
                          { emit: 'event', level: 'query' }, // Log all queries in development
                          { emit: 'event', level: 'info' }, // Log info messages in development
                          { emit: 'event', level: 'warn' } // Log warnings in development
                      ]
                    : []),
                { emit: 'event', level: 'error' } // Always log errors regardless of environment
            ] as Prisma.LogDefinition[],
            errorFormat: appConfig.server.mode === 'development' ? 'pretty' : 'minimal' // Pretty errors in dev, minimal in prod
        });

        this.setupEventHandlers();
    }

    private setupEventHandlers() {
        // Performance monitoring for development using config thresholds
        if (appConfig.server.mode === 'development') {
            this.$on('query' as never, (e: Prisma.QueryEvent) => {
                const duration = e.duration;
                // Use monitoring configuration for query performance thresholds
                if (duration > appConfig.monitoring.performance.slowRequestThreshold) {
                    this.chalk.warn(`Slow query (${duration}ms): ${e.query.substring(0, 100)}...`);
                } else if (duration > appConfig.monitoring.performance.mediumRequestThreshold) {
                    this.chalk.debug(`Medium query (${duration}ms): ${e.query.substring(0, 50)}...`);
                } else if (duration > appConfig.monitoring.performance.fastRequestThreshold) {
                    this.chalk.debug(`Query (${duration}ms): ${e.query.substring(0, 50)}...`);
                }
            });

            this.$on('info' as never, (e: Prisma.LogEvent) => {
                this.chalk.info(e.message);
            });
        }

        // Always log errors and warnings
        this.$on('error' as never, (e: Prisma.LogEvent) => {
            this.chalk.error(`Database error: ${e.message}`);
        });

        this.$on('warn' as never, (e: Prisma.LogEvent) => {
            this.chalk.warn(`Database warning: ${e.message}`);
        });
    }

    async onApplicationBootstrap() {
        try {
            if (!PrismaService.isConnected) {
                await this.$connect(); // Connect to database using optimized connection parameters
                PrismaService.isConnected = true;
                this.chalk.success('Database connection established');
            }

            // Run seeding asynchronously to not block startup if database seeding is enabled
            if (!PrismaService.isSeeded && sql.allowSeed) {
                setImmediate(async () => {
                    try {
                        await seedDatabase();
                        PrismaService.isSeeded = true;
                        this.chalk.success('Database seeding completed');
                    } catch (error) {
                        this.chalk.error('Database seeding failed:', error);
                    }
                });
            }
        } catch (error) {
            this.chalk.error('Failed to connect to database:', error);
            throw error;
        }
    }

    async onModuleDestroy() {
        if (PrismaService.isConnected) {
            await this.$disconnect(); // Gracefully disconnect from database
            PrismaService.isConnected = false;
            this.chalk.info('Database connection closed');
        }
    }

    // Add health check method for monitoring
    async healthCheck(): Promise<boolean> {
        try {
            await this.$queryRaw`SELECT 1`; // Simple query to check database connectivity
            return true;
        } catch {
            return false;
        }
    }

    // Add transaction helper with configurable timeout using database performance settings
    async executeTransaction<T>(
        fn: (tx: Prisma.TransactionClient) => Promise<T>,
        options?: {
            maxWait?: number;
            timeout?: number;
        }
    ): Promise<T> {
        return this.$transaction(fn, {
            maxWait: options?.maxWait || 5000, // 5 seconds default wait time
            timeout: options?.timeout || sql.performance.queryTimeout // Use configured query timeout
        });
    }

    // Add connection pool status for monitoring
    getConnectionInfo() {
        return {
            isConnected: PrismaService.isConnected,
            isSeeded: PrismaService.isSeeded,
            connectionString: `mysql://${sql.username}:***@${sql.host}:${sql.port}/${sql.database}`, // Masked connection string
            performanceConfig: {
                poolTimeout: sql.performance.poolTimeout,
                socketTimeout: sql.performance.socketTimeout,
                connectTimeout: sql.performance.connectTimeout,
                queryTimeout: sql.performance.queryTimeout
            }
        };
    }
}
