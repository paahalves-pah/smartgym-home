import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ScheduleModule } from '@nestjs/schedule';
import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';

import { join } from 'path';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

import { UsuariosModule } from './usuarios/usuarios.module.js';
import { AuthModule } from './auth/auth.module.js';
import { EquipamentosModule } from './equipamentos/equipamentos.module.js';
import { UtilizacoesModule } from './utilizacoes/utilizacoes.module.js';
import { ManutencoesModule } from './manutencoes/manutencoes.module.js';
import { InteligenciaModule } from './inteligencia/inteligencia.module.js';
import { DashboardModule } from './dashboard/dashboard.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    ScheduleModule.forRoot(),

    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,

      ssl: {
        rejectUnauthorized: false,
      },

      autoLoadEntities: true,
      synchronize: false,
    }),

    ObserveModule.forRoot({
      appKey: process.env.OBSERVE_APP_KEY ?? 'YOUR_APP_KEY',
      appSecret: process.env.OBSERVE_APP_SECRET ?? 'YOUR_APP_SECRET',
      serviceId: 'smartgym-api',
    }),

    UsuariosModule,
    AuthModule,
    EquipamentosModule,
    UtilizacoesModule,
    ManutencoesModule,
    InteligenciaModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}