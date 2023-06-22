import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { AUTH } from '@ukef/constants';
import { AuthService } from '@ukef/modules/auth/auth.service';
import { HeaderAPIKeyStrategy } from 'passport-headerapikey';

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(HeaderAPIKeyStrategy, AUTH.STRATEGY) {
  constructor(private readonly authService: AuthService) {
    super({ header: AUTH.STRATEGY, prefix: '' }, true, (apiKey: string, done: (arg0: UnauthorizedException, arg1: boolean) => void) => {
      const hasValidKey = this.authService.validateApiKey(apiKey);
      if (hasValidKey) {
        return done(null, true);
      }
      done(new UnauthorizedException(), null);
    });
  }
}
