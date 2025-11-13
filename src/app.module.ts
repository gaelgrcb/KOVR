// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
// Import the TypeORM base type
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],

      // I use 'TypeOrmModuleOptions' imported as the return type
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => {

        const dbType = configService.get<'postgres' | 'mssql'>('DB_TYPE');

        // 1. I create the base configuration
        const baseConfig = {
          type: dbType as 'postgres' | 'mssql',
          host: configService.get<string>('DB_HOST'),
          port: configService.get<number>('DB_PORT'),
          username: configService.get<string>('DB_USER'),
          password: configService.get<string>('DB_PASS'),
          database: configService.get<string>('DB_NAME'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: true, // ¡Quitar en producción!
        };

        // 2. If (and only if) is mssql, we add extra options
        if (dbType === 'mssql') {
          return {
            ...baseConfig,
            options: {
              encrypt: false, // Required only en DEV mode
              trustServerCertificate: true, // Required only en DEV mode
            },
          };
        }

        // 3. If its postgres, only return teh base configuration
        return baseConfig;
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }