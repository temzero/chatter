import { HttpException, HttpStatus } from '@nestjs/common';
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from 'src/shared/types/enums/error-message.enum';

export class ErrorResponse {
  static throw(
    error: unknown,
    defaultMessage: string,
    defaultStatus: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
  ): never {
    if (error instanceof HttpException) {
      throw error;
    }
    const message = error instanceof Error ? error.message : defaultMessage;
    throw new HttpException(message, defaultStatus);
  }

  // 400 Bad Request
  static badRequest(
    code: BadRequestError = BadRequestError.BAD_REQUEST,
  ): never {
    throw new HttpException({ code }, HttpStatus.BAD_REQUEST);
  }

  // 401 Unauthorized
  static unauthorized(
    code: UnauthorizedError = UnauthorizedError.UNAUTHORIZED,
  ): never {
    throw new HttpException({ code }, HttpStatus.UNAUTHORIZED);
  }

  static forbidden(code: ForbiddenError = ForbiddenError.FORBIDDEN): never {
    throw new HttpException({ code }, HttpStatus.FORBIDDEN);
  }

  // 404 Not Found
  static notFound(
    code: NotFoundError = NotFoundError.RESOURCE_NOT_FOUND,
  ): never {
    throw new HttpException({ code }, HttpStatus.NOT_FOUND);
  }

  // 409 Conflict
  static conflict(code: ConflictError = ConflictError.CONFLICT): never {
    throw new HttpException({ code }, HttpStatus.CONFLICT);
  }
}
