import { Catch, NotFoundException } from '@nestjs/common';
import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import type { Response } from 'express';

@Catch(NotFoundException)
export class NotFoundFilter implements ExceptionFilter {
  catch(_exception: NotFoundException, host: ArgumentsHost) {
    host.switchToHttp().getResponse<Response>().status(404).json({ error: 'not_found' });
  }
}
