import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { readChatInput } from './chat-input.js';
import { OllamaService } from './ollama.service.js';

@Controller('api/chat')
export class ChatController {
  constructor(private readonly ollama: OllamaService) {}

  @Post()
  @HttpCode(200)
  reply(@Body() body: unknown) {
    return this.ollama.reply(readChatInput(body));
  }
}
