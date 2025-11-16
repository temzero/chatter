// src/auth/strategies/local.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local'; // Note: using local strategy now
import { AuthService } from '../services/auth.service';
import { ErrorResponse } from 'src/common/api-response/errors';
import { UnauthorizedError } from 'src/shared/types/enums/error-message.enum';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'identifier', // matches LoginDto field
    });
  }

  async validate(identifier: string, password: string): Promise<any> {
    const user = await this.authService.validateUser({ identifier, password });
    if (!user) {
      ErrorResponse.unauthorized(UnauthorizedError.INVALID_CREDENTIALS);
    }
    return user;
  }
}
