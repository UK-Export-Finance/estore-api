import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CustodianConfig, KEY as CUSTODIAN_CONFIG_KEY } from '@ukef/config/custodian.config';
import { HttpModule } from '@ukef/modules/http/http.module';

import { CustodianService } from './custodian.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const { baseUrl, apiKeyHeaderName, apiKeyHeaderValue, maxRedirects, timeout } = configService.get<CustodianConfig>(CUSTODIAN_CONFIG_KEY);
        return {
          baseURL: baseUrl,
          maxRedirects,
          timeout,
          headers: {
            [apiKeyHeaderName]: apiKeyHeaderValue,
            Accept: 'application/json',
          },
        };
      },
    }),
  ],
  providers: [CustodianService],
  exports: [CustodianService],
})
export class CustodianModule {}
