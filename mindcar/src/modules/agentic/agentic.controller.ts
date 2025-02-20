import * as express from 'express';
import { AgenticService } from './agentic.service';
import { AgentSessionBody } from 'src/interfaces/mindcar';
import { Body, Controller, Post, Req, Res } from '@nestjs/common';

@Controller('api/agentic')
export class AgenticController {
  constructor(private readonly agenticService: AgenticService) {}

  @Post('agent_tool_use')
  async agentToolUse(
    @Req() req: express.Request,
    @Res() res: express.Response,
    @Body() body: AgentSessionBody,
  ) {
    console.log(body.session_id, body.exchange_id, body.query);
    res.write(
      `data: ${JSON.stringify({ session_id: body.session_id, started: true })}`,
    );
    for await (const event of this.agenticService.agentToolUse(body)) {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    }
    res.write(`data: ${JSON.stringify({ done: '[CODESTORY_DONE]' })}`);
    res.end();
  }
}
