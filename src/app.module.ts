import { StartModule } from './modules/start/start.module';
import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }),
    TelegrafModule.forRootAsync({
      botName: 'FinanceBot',
      useFactory: () => ({
        token: '1974627109:AAGYyjRQzmmKzAiu4FlmOHMD4QLASXi6pho',
        include: [StartModule],
      }),
    }),
    StartModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
