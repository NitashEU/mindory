import * as openai from 'openai';
import { ClsService } from 'nestjs-cls';
import { Injectable, Scope } from '@nestjs/common';
import { SessionClsStore } from '../shared/session/cls';
import {
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from 'openai/resources';
import {
  AgentSessionBody,
  SideCarAgentEvent,
  SideCarAgentUIEvent,
} from 'src/interfaces/mindcar';

@Injectable({})
export class AgenticService {
  constructor(private readonly sessionService: ClsService<SessionClsStore>) {}

  // Enhanced tools with additional capabilities
  private tools: ChatCompletionTool[] = [
    {
      type: 'function' as const,
      function: {
        name: 'complete_task',
        description: "Complete a task or provide a response based on the user's query",
        parameters: {
          type: 'object',
          properties: {
            thinking: {
              type: 'string',
              description: "The AI's reasoning about how it handled the query, in markdown format",
            },
            AttemptCompletion: {
              type: 'object',
              properties: {
                result: {
                  type: 'string',
                  description: "The result or response to the user's query",
                },
                command: {
                  type: 'string',
                  description: "Any command to execute (use 'none' if not applicable)",
                  default: 'none',
                },
              },
              required: ['result'],
              additionalProperties: false,
            },
          },
          required: ['thinking', 'AttemptCompletion'],
          additionalProperties: false,
        },
        strict: true,
      },
    },
    {
      type: 'function' as const,
      function: {
        name: 'search_files',
        description: 'Search for files in the codebase',
        parameters: {
          type: 'object',
          properties: {
            pattern: {
              type: 'string',
              description: 'Search pattern or regex to find files',
            },
            fileType: {
              type: 'string',
              description: 'File extension or type to filter by',
              optional: true,
            },
          },
          required: ['pattern'],
        },
      },
    },
    {
      type: 'function' as const,
      function: {
        name: 'edit_code',
        description: 'Make changes to code files',
        parameters: {
          type: 'object',
          properties: {
            filePath: {
              type: 'string',
              description: 'Path to the file to edit',
            },
            changes: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: {
                    type: 'string',
                    enum: ['insert', 'replace', 'delete'],
                    description: 'Type of edit operation',
                  },
                  content: {
                    type: 'string',
                    description: 'Content to insert or replace with',
                  },
                  startLine: {
                    type: 'number',
                    description: 'Starting line number for the edit',
                  },
                  endLine: {
                    type: 'number',
                    description: 'Ending line number for the edit (for replace/delete)',
                    optional: true,
                  },
                },
                required: ['type', 'startLine'],
              },
            },
          },
          required: ['filePath', 'changes'],
        },
      },
    },
    {
      type: 'function' as const,
      function: {
        name: 'semantic_search',
        description: 'Perform semantic search in the codebase',
        parameters: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Natural language search query',
            },
            max_results: {
              type: 'number',
              description: 'Maximum number of results to return',
              default: 5,
            },
          },
          required: ['query'],
        },
      },
    },
    {
      type: 'function' as const,
      function: {
        name: 'execute_command',
        description: 'Execute a terminal command',
        parameters: {
          type: 'object',
          properties: {
            command: {
              type: 'string',
              description: 'Command to execute',
            },
            is_input: {
              type: 'boolean',
              description: 'Whether this is input to a running process',
              default: false,
            },
          },
          required: ['command'],
        },
      },
    },
    {
      type: 'function' as const,
      function: {
        name: 'get_diagnostics',
        description: 'Get LSP diagnostics for a file',
        parameters: {
          type: 'object',
          properties: {
            file_path: {
              type: 'string',
              description: 'Path to the file to get diagnostics for',
            },
          },
          required: ['file_path'],
        },
      },
    },
    {
      type: 'function' as const,
      function: {
        name: 'ask_followup',
        description: 'Ask a followup question to clarify the task',
        parameters: {
          type: 'object',
          properties: {
            question: {
              type: 'string',
              description: 'The followup question to ask',
            },
            context: {
              type: 'string',
              description: 'Context about why this question is being asked',
            },
          },
          required: ['question', 'context'],
        },
      },
    },
  ];

  async *agentToolUse(data: AgentSessionBody) {
    const session = this.sessionService.get().session;
    let key = '';
    for (const provider of data.model_configuration.providers) {
      if (provider.GoogleAIStudio) {
        key = provider.GoogleAIStudio.api_key;
        break;
      }
    }

    // Emit session start event
    yield {
      session_id: data.session_id,
      started: true,
    };

    session.humanMessageToolUse(
      data.exchange_id,
      data.query,
      data.all_files,
      data.open_files,
      data.user_context,
    );

    // This will emit the ExchangeEvents through sendUIEvent
    session.acceptOpenExchanges();

    const openaiClient = new openai.OpenAI({
      apiKey: key,
      baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    });

    const messages: ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `
          You are SOTA-agent, a highly skilled AI software engineer with extensive knowledge in all programming languages, frameworks, design patterns, and best practices. 
          Your primary goal is to accomplish tasks related to software development, file manipulation, and system operations within the specified project directory.

          You have access to the following tools:
          1. complete_task: For general responses and simple tasks
             - thinking: Your reasoning in markdown format
             - AttemptCompletion: Result and optional command

          2. edit_code: For making code changes
             - file_path: Path to the file
             - edit_type: 'insert', 'replace', or 'delete'
             - old_text: Text to replace (for replace)
             - new_text: New text to insert/replace
             - line_number: Line number for insert

          3. search_files: Find files in the codebase
             - pattern: Search pattern/regex
             - fileType: Optional file extension filter

          4. semantic_search: Natural language code search
             - query: Search query
             - max_results: Maximum results to return

          5. execute_command: Run terminal commands
             - command: Command to execute
             - is_input: Whether it's input to running process

          6. get_diagnostics: Get LSP diagnostics
             - file_path: Path to check

          7. ask_followup: Ask clarifying questions
             - question: The question to ask
             - context: Why you're asking

          Always:
          1. Think through the problem first using "thinking"
          2. Choose the most appropriate tool for the task
          3. Provide detailed reasoning in markdown format
          4. Handle errors gracefully
          5. Ask followup questions when needed
        `,
      },
      {
        role: 'user',
        content: data.query,
      },
    ];

    const stream = await openaiClient.chat.completions.create({
      model: data.model_configuration.slow_model,
      messages,
      tools: this.tools,
      tool_choice: 'required',
      stream: true,
    });

    let answer_up_until_now = '';
    let toolCallId: string | null = null;
    let toolArgs = '';

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta;

      console.log('Chunk:', JSON.stringify(delta, null, 2));

      if (delta?.tool_calls) {
        const toolCall = delta.tool_calls[0];

        if (toolCall?.id) {
          toolCallId = toolCall.id;
        }

        if (toolCall?.function?.arguments) {
          toolArgs += toolCall.function.arguments;

          try {
            const parsedArgs = JSON.parse(toolArgs);
            const toolName = toolCall?.function?.name;

            // Common thinking event
            if (parsedArgs.thinking) {
              yield {
                request_id: data.session_id,
                exchange_id: data.exchange_id,
                event: {
                  FrameworkEvent: {
                    ToolThinking: {
                      thinking: parsedArgs.thinking,
                    },
                  },
                },
              };
            }

            // Tool type detection
            if (toolName) {
              yield {
                request_id: data.session_id,
                exchange_id: data.exchange_id,
                event: {
                  FrameworkEvent: {
                    ToolTypeFound: {
                      tool_type: toolName,
                    },
                  },
                },
              };
            }

            // Handle parameters based on tool type
            switch (toolName) {
              case 'complete_task':
                if (parsedArgs.AttemptCompletion?.result) {
                  yield {
                    request_id: data.session_id,
                    exchange_id: data.exchange_id,
                    event: {
                      FrameworkEvent: {
                        ToolParameterFound: {
                          tool_parameter_input: {
                            field_name: 'result',
                            field_content_up_until_now: parsedArgs.AttemptCompletion.result,
                            field_content_delta: parsedArgs.AttemptCompletion.result,
                          },
                        },
                      },
                    },
                  };
                }
                break;

              case 'edit_code':
                if (parsedArgs.file_path) {
                  yield {
                    request_id: data.session_id,
                    exchange_id: data.exchange_id,
                    event: {
                      FrameworkEvent: {
                        ToolParameterFound: {
                          tool_parameter_input: {
                            field_name: 'file_path',
                            field_content_up_until_now: parsedArgs.file_path,
                            field_content_delta: parsedArgs.file_path,
                          },
                        },
                      },
                    },
                  };
                }
                break;

              case 'execute_command':
                if (parsedArgs.command) {
                  yield {
                    request_id: data.session_id,
                    exchange_id: data.exchange_id,
                    event: {
                      FrameworkEvent: {
                        ToolParameterFound: {
                          tool_parameter_input: {
                            field_name: 'command',
                            field_content_up_until_now: parsedArgs.command,
                            field_content_delta: parsedArgs.command,
                          },
                        },
                      },
                    },
                  };
                }
                break;
            }

            // Tool use detection
            if (parsedArgs.thinking) {
              yield {
                request_id: data.session_id,
                exchange_id: data.exchange_id,
                event: {
                  FrameworkEvent: {
                    ToolUseDetected: {
                      tool_use_partial_input: parsedArgs,
                      thinking: parsedArgs.thinking,
                    },
                  },
                },
              };
            }
          } catch (e) {
            // Continue accumulating arguments if not complete JSON yet
            continue;
          }
        }
      }
    }
  }
}

// '"session_id":"7282c256-4044-4359-920d-a86e19a2c904","started":true}'
// '"request_id":"7282c256-4044-4359-920d-a86e19a2c904","exchange_id":"response_17","event":{"ExchangeEvent":{"EditsExchangeState":{"edits_state":"Accepted","files":[]}}}}'
// '"request_id":"7282c256-4044-4359-920d-a86e19a2c904","exchange_id":"response_17","event":{"ExchangeEvent":{"FinishedExchange":{"exchange_id":"response_17","session_id":"7282c256-4044-4359-920d-a86e19a2c904"}}}}'
// `"request_id":"7282c256-4044-4359-920d-a86e19a2c904","exchange_id":"response_19","event":{"FrameworkEvent":{"ToolThinking":{"thinking":"The user's query \\"how r u\\" is not a task that I can accomplish. I am designed to accomplish tasks related to software development, file manipulation, and system operations. I will respond that I am ready to assist with any programming tasks."}}}}`
// '"request_id":"7282c256-4044-4359-920d-a86e19a2c904","exchange_id":"response_19","event":{"FrameworkEvent":{"ToolTypeFound":{"tool_type":"AttemptCompletion"}}}}'
// '"request_id":"7282c256-4044-4359-920d-a86e19a2c904","exchange_id":"response_19","event":{"FrameworkEvent":{"ToolParameterFound":{"tool_parameter_input":{"field_name":"result","field_content_up_until_now":"I am ready to assist with any programming tasks.","field_content_delta":"I am ready to assist with any programming tasks."}}}}}'
// '"request_id":"7282c256-4044-4359-920d-a86e19a2c904","exchange_id":"response_19","event":{"FrameworkEvent":{"ToolParameterFound":{"tool_parameter_input":{"field_name":"command","field_content_up_until_now":"no command provided","field_content_delta":"no command provided"}}}}}'
// `"request_id":"7282c256-4044-4359-920d-a86e19a2c904","exchange_id":"response_19","event":{"FrameworkEvent":{"ToolUseDetected":{"tool_use_partial_input":{"AttemptCompletion":{"result":"I am ready to assist with any programming tasks.","command":"no command provided"}},"thinking":"The user's query \\"how r u\\" is not a task that I can accomplish. I am designed to accomplish tasks related to software development, file manipulation, and system operations. I will respond that I am ready to assist with any programming tasks."}}}}`
