import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidPasswordException extends HttpException {
  constructor() {
    super('Invalid password', HttpStatus.UNAUTHORIZED);
  }
}

export class NoteNotFoundException extends HttpException {
  constructor() {
    super('Note not found', HttpStatus.NOT_FOUND);
  }
}
