import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { UsuariosModule } from './usuarios/usuarios.module.js';
import { AuthModule } from './auth/auth.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
  ConfigModule.forRoot({
    isGlobal: true,
  }),

  TypeOrmModule.forRoot({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
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
],
})
export class AppModule {}
