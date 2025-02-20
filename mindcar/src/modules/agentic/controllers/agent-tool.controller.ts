import { Controller, Post, Body, Sse, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Observable, Subject } from 'rxjs';
import { AgentToolService } from '../services/agent-tool.service';
import { AgentToolUseRequest, UIEventWithID } from '../interfaces/agent-tool.interface';

@ApiTags('Agentic')
@Controller('api/agentic')
export class AgentToolController {
  private eventSubjects: Map<string, Subject<UIEventWithID>> = new Map();

  constructor(private readonly agentToolService: AgentToolService) {}

  @Post('agent_tool_use')
  @Sse()
  @ApiOperation({ summary: 'Use agent tool with SSE response' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tool use initiated successfully',
  })
  async agentToolUse(
    @Body() request: AgentToolUseRequest,
  ): Promise<Observable<UIEventWithID>> {
    // Create a new subject for this request
    const eventSubject = new Subject<UIEventWithID>();
    const key = `${request.sessionId}_${request.exchangeId}`;
    this.eventSubjects.set(key, eventSubject);

    // Handle cleanup when the client disconnects
    const cleanup = () => {
      this.eventSubjects.delete(key);
      eventSubject.complete();
    };

    try {
      return await this.agentToolService.handleToolUse(request, eventSubject);
    } catch (error) {
      cleanup();
      throw error;
    }
  }

  @Post('cancel_tool_use')
  @ApiOperation({ summary: 'Cancel ongoing tool use' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tool use cancelled successfully',
  })
  async cancelToolUse(
    @Body('sessionId') sessionId: string,
    @Body('exchangeId') exchangeId: string,
  ): Promise<void> {
    const key = `${sessionId}_${exchangeId}`;
    const subject = this.eventSubjects.get(key);
    
    if (subject) {
      // Complete the subject and remove it from the map
      subject.complete();
      this.eventSubjects.delete(key);
    }

    await this.agentToolService.cancelToolUse(sessionId, exchangeId);
  }
}