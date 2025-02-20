import { Injectable } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
import { AgentToolUseRequest, UIEventWithID } from '../interfaces/agent-tool.interface';
import { LLMClientException } from '../../../shared/exceptions/custom.exception';

@Injectable()
export class AgentToolService {
  async handleToolUse(
    request: AgentToolUseRequest,
    eventSubject: Subject<UIEventWithID>
  ): Promise<Observable<UIEventWithID>> {
    try {
      // Send initial event
      eventSubject.next({
        type: 'START',
        sessionId: request.sessionId,
        exchangeId: request.exchangeId,
        data: {
          started: true,
        },
      });

      // TODO: Implement actual tool use logic here
      // This will involve:
      // 1. Setting up LLM client with the provided configuration
      // 2. Managing the session and exchange state
      // 3. Handling the tool execution
      // 4. Streaming events back to the client

      // For now, just send a mock response
      setTimeout(() => {
        eventSubject.next({
          type: 'THINKING',
          sessionId: request.sessionId,
          exchangeId: request.exchangeId,
          data: {
            message: 'Processing your request...',
          },
        });
      }, 1000);

      // Return the observable for the event stream
      return new Observable((subscriber) => {
        const subscription = eventSubject.subscribe(subscriber);
        return () => {
          subscription.unsubscribe();
          eventSubject.complete();
        };
      });
    } catch (error) {
      if (error instanceof LLMClientException) {
        throw error;
      }
      throw new LLMClientException(error.message);
    }
  }

  async cancelToolUse(sessionId: string, exchangeId: string): Promise<void> {
    // TODO: Implement cancellation logic
    console.log(`Cancelling tool use for session ${sessionId} and exchange ${exchangeId}`);
  }
}