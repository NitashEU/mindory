import * as openai from 'openai';
import { AgentSessionBody, SideCarAgentEvent } from 'src/interfaces/mindcar';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AgenticService {
  constructor() {}

  async *agentToolUse(data: AgentSessionBody) {
    let key = '';
    for (const provider of data.model_configuration.providers) {
      if (provider.GoogleAIStudio) {
        key = provider.GoogleAIStudio.api_key;
        break;
      }
    }
    const openaiClient = new openai.OpenAI({
      apiKey: key,
      baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    });
    const stream = await openaiClient.chat.completions.create({
      model: data.model_configuration.slow_model,
      messages: [
        {
          role: 'system',
          content:
            'You are SOTA-agent, a highly skilled AI software engineer with extensive knowledge in all programming languages, frameworks, design patterns, and best practices. Your primary goal is to accomplish tasks related to software development, file manipulation, and system operations within the specified project directory.',
        },
        {
          role: 'user',
          content: data.query,
        },
      ],
      stream: true,
    });
    let answer_up_until_now = '';
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content || '';
      answer_up_until_now += delta;
      yield {
        request_id: data.session_id,
        exchange_id: data.exchange_id,
        event: {
          ChatEvent: {
            answer_up_until_now,
            delta,
          },
        },
      } as SideCarAgentEvent;
    }
    // TODO: Implement tool use with SSE support
  }
}
