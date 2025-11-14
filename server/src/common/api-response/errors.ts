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
    message: BadRequestError = BadRequestError.BAD_REQUEST,
  ): never {
    throw new HttpException(message, HttpStatus.BAD_REQUEST);
  }

  // 401 Unauthorized
  static unauthorized(
    message: UnauthorizedError = UnauthorizedError.UNAUTHORIZED,
  ): never {
    throw new HttpException(message, HttpStatus.UNAUTHORIZED);
  }

  static forbidden(message: ForbiddenError = ForbiddenError.FORBIDDEN): never {
    throw new HttpException(message, HttpStatus.FORBIDDEN);
  }

  // 404 Not Found
  static notFound(
    message: NotFoundError = NotFoundError.RESOURCE_NOT_FOUND,
  ): never {
    throw new HttpException(message, HttpStatus.NOT_FOUND);
  }

  // 409 Conflict
  static conflict(message: ConflictError = ConflictError.CONFLICT): never {
    throw new HttpException(message, HttpStatus.CONFLICT);
  }
}
