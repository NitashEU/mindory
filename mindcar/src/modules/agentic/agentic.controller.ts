import * as express from 'express';
import { AgenticService } from './agentic.service';
import { AgentSessionBody } from 'src/interfaces/mindcar';
import {
  Body,
  Controller,
  Post,
  Req,
  Res
  } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { SessionClsStore } from '../shared/session/cls';

@Controller('api/agentic')
export class AgenticController {
  constructor(
    private readonly agenticService: AgenticService,
    private readonly sessionService: ClsService<SessionClsStore>,
  ) {}

  @Post('agent_tool_use')
  async agentToolUse(
    @Res() res: express.Response,
    @Body() body: AgentSessionBody,
  ) {
    const session = this.sessionService.get().session;
    // session.start();
    for await (const event of this.agenticService.agentToolUse(body)) {
      session.sendUIEvent(event as any);
    }
    session.end();
    res.end();
  }
}
