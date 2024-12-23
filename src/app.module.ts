import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { User } from './auth/entities/user.entity'; 

@Module({
  imports: [
    
    ConfigModule.forRoot({
      isGlobal: true, 
      envFilePath: '.env', 
    }),

    TypeOrmModule.forRoot({
      type: 'postgres', 
      host: process.env.DB_HOST, 
      port: parseInt(process.env.DB_PORT, 10), 
      username: process.env.DB_USERNAME, 
      password: process.env.DB_PASSWORD, 
      database: process.env.DB_NAME, 
      entities: [User], 
      synchronize: true, 
    }),

    
    AuthModule,
  ],
})
export class AppModule {}
