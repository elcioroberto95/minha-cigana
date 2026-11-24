import { All, Controller, Get, Header, HttpCode } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  @Header('Cache-Control', 'no-store')
  check() {
    return { status: 'ok' };
  }

  @All()
  @HttpCode(405)
  @Header('Allow', 'GET, HEAD')
  methodNotAllowed() {
    return { error: 'method_not_allowed' };
  }
}
