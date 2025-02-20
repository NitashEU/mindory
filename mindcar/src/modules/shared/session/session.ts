import * as express from 'express';
import {
  FinishedExchangeEvent,
  SideCarAgentDoneEvent,
  SideCarAgentEvent,
  SideCarAgentStartStreamingEvent,
} from 'src/interfaces/mindcar';

export class MCSession {
  private response: express.Response;

  constructor(
    private readonly sessionId: string,
    private readonly exchanges: string[] = [],
  ) {}

  public setResponse(res: express.Response) {
    this.response = res;
  }

  public start() {
    this.sendUIEvent({
      session_id: this.sessionId,
      started: true,
    } as SideCarAgentStartStreamingEvent);
  }

  public end() {
    this.sendUIEvent({ done: '[CODESTORY_DONE]' } as SideCarAgentDoneEvent);
  }

  public humanMessageToolUse(
    exchangeId: string,
    humanMessage: string,
    allFiles: string[],
    openFiles: string[],
    userContext: any,
  ) {
    const userMessage = `
      <editor_status>
        <open_files>
          ${openFiles.join('\n')}
        </open_files>
        <visible_files>
          ${allFiles.join('\n')}
        </visible_files>
      </editor_status>
      <user_provided_context>
        
      </user_provided_context>
      <user_query>
        ${humanMessage}
      </user_query>
    `;

    this.exchanges.push(exchangeId);
  }

  public acceptOpenExchanges() {
    for (const exchange of this.exchanges) {
      this.sendUIEvent({
        session_id: this.sessionId,
        exchange_id: exchange,
        event: {
          ExchangeEvent: {
            EditsExchangeState: {
              edits_state: 'Accepted',
              files: [],
            },
            FinishedExchange: undefined,
            PlansExchangeState: undefined,
            ExecutionState: undefined,
            RegeneratePlan: undefined,
            TerminalCommand: undefined,
          },
        },
      } as any);
      this.sendUIEvent({
        request_id: this.sessionId,
        exchange_id: exchange,
        event: {
          ExchangeEvent: {
            FinishedExchange: {
              session_id: this.sessionId,
              exchange_id: exchange,
            },
          },
        },
      } as any);
    }
  }

  public sendUIEvent(event: SideCarAgentEvent) {
    console.log(
      'Sending UI event:',
      JSON.stringify(event, null, 2).replaceAll(
        'exchange_id": "request_',
        'exchange_id": "response_',
      ),
    );
    this.response.write(
      `data: ${JSON.stringify(event).replaceAll('exchange_id": "request_', 'exchange_id": "response_')}\n\n`,
    );
  }
}
