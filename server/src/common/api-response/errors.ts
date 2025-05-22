import { HttpException, HttpStatus } from '@nestjs/common';

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

  static notFound(message = 'Resource not found'): never {
    throw new HttpException(message, HttpStatus.NOT_FOUND);
  }

  static badRequest(message = 'Bad request'): never {
    throw new HttpException(message, HttpStatus.BAD_REQUEST);
  }

  static unauthorized(message = 'Unauthorized'): never {
    throw new HttpException(message, HttpStatus.UNAUTHORIZED);
  }

  static conflict(message = 'Conflict'): never {
    throw new HttpException(message, HttpStatus.CONFLICT);
  }
}
