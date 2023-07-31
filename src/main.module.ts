import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import config from '@ukef/config';
import { EstoreModule } from '@ukef/modules/estore.module';
import { LoggerModule } from 'nestjs-pino';

import { REDACT_STRING_PATHS, REDACT_STRINGS } from './constants';
import { redactStringsInLogArgs } from './helpers/redact-strings-in-log-args.helper';
import { HEADERS_LOG_KEY, INCOMING_RESPONSE_LOG_KEY, OUTGOING_REQUEST_LOG_KEY } from './modules/http/http.constants';
import { logKeysToRedact } from './modules/logging/log-keys-to-redact';
import { LoggingInterceptor } from './modules/logging/logging-interceptor.helper';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [...config],
    }),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        pinoHttp: {
          customProps: () => ({
            context: 'HTTP',
          }),
          level: config.get<string>('app.logLevel'),
          transport: {
            target: 'pino-pretty',
            options: {
              singleLine: config.get<boolean>('app.singleLineLogFormat'),
            },
          },
          hooks: {
            logMethod(inputArgs: any[], method) {
              return method.apply(this, redactStringsInLogArgs(config.get<boolean>('app.redactLogs'), REDACT_STRING_PATHS, REDACT_STRINGS, inputArgs));
            },
          },
          redact: logKeysToRedact({
            redactLogs: config.get<boolean>('app.redactLogs'),
            clientRequest: {
              logKey: 'req',
              headersLogKey: 'headers',
            },
            outgoingRequest: {
              logKey: OUTGOING_REQUEST_LOG_KEY,
              headersLogKey: HEADERS_LOG_KEY,
            },
            incomingResponse: {
              logKey: INCOMING_RESPONSE_LOG_KEY,
              headersLogKey: HEADERS_LOG_KEY,
              sensitiveHeaders: ['set-cookie'],
            },
            error: {
              logKey: 'err',
              headersLogKey: 'headers',
            },
            azureStorageExcessideData: {
              logKey: 'err',
              excessideDataField: 'operationSpec',
            },
          }),
        },
      }),
    }),
    EstoreModule,
  ],
  controllers: [],
  providers: [{ provide: APP_INTERCEPTOR, useClass: LoggingInterceptor }],
})
export class MainModule {}
