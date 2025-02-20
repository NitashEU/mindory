/*

/// The exchange can be in one of the states
///
/// Its either that the edits made were accepted or rejected
/// it could also have been cancelled by the user
/// Default when its created is in running state
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub enum ExchangeState {
    Accepted,
    Rejected,
    Cancelled,
    Running,
    UserMessage,
}

impl Default for ExchangeState {
    fn default() -> Self {
        ExchangeState::Running
    }
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub enum ExchangeType {
    HumanChat(ExchangeTypeHuman),
    AgentChat(ExchangeTypeAgent),
    // what do we store over here for the anchored edit, it can't just be the
    // user query? we probably have to store the snippet we were trying to edit
    // as well
    Edit(ExchangeTypeEdit),
    Plan(ExchangeTypePlan),
    ToolOutput(ExchangeTypeToolOutput),
}

// TODO(codestory): The user is probably going to add more context over here as they
// keep iterating with their requests over here, we have to do something about it
// or we can keep it simple and just make it so that we store the previous iterations over here
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ExchangeTypePlan {
    previous_queries: Vec<String>,
    query: String,
    user_context: UserContext,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ExchangeEditInformationAgentic {
    query: String,
    codebase_search: bool,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ExchangeEditInformationAnchored {
    query: String,
    fs_file_path: String,
    range: Range,
    selection_context: String,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub enum ExchangeEditInformation {
    Agentic(ExchangeEditInformationAgentic),
    Anchored(ExchangeEditInformationAnchored),
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ExchangeTypeEdit {
    information: ExchangeEditInformation,
    user_context: UserContext,
    exchange_type: AideEditMode,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ExchangeTypeHuman {
    query: String,
    user_context: UserContext,
    project_labels: Vec<String>,
    repo_ref: RepoRef,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ExchangeTypeToolOutput {
    tool_type: ToolType,
    output: String,
    exchange_id: String,
    user_context: UserContext,
    tool_use_id: String,
}

impl ExchangeTypeToolOutput {
    pub fn new(
        tool_type: ToolType,
        output: String,
        exchange_id: String,
        user_context: UserContext,
        tool_use_id: String,
    ) -> Self {
        Self {
            tool_type,
            output,
            exchange_id,
            user_context,
            tool_use_id,
        }
    }
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ExchangeReplyAgentPlan {
    plan_steps: Vec<Step>,
    // plan discarded over here represents the fact that the plan we CANCELLED
    // it had other meanings but thats what we are going with now 🔫
    plan_discarded: bool,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ExchangeReplyAgentChat {
    reply: String,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ExchangeReplyAgentEdit {
    edits_made_diff: String,
    accepted: bool,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ExchangeReplyAgentTool {
    tool_type: ToolType,
    // we need some kind of partial tool input over here as well so we can parse
    // the data out properly
    // for now, I am leaving things here until I can come up with a proper API for that
    tool_input_partial: ToolInputPartial,
    thinking: String,
    // The tool use id which we need to send back along with the tool parameters
    // if they are present
    tool_use_id: String,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub enum ExchangeReplyAgent {
    Plan(ExchangeReplyAgentPlan),
    Chat(ExchangeReplyAgentChat),
    Edit(ExchangeReplyAgentEdit),
    Tool(ExchangeReplyAgentTool),
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ExchangeTypeAgent {
    reply: ExchangeReplyAgent,
    /// This points to the exchange id which we are replying to as the agent
    parent_exchange_id: String,
}

impl ExchangeTypeAgent {
    fn chat_reply(reply: String, parent_exchange_id: String) -> Self {
        Self {
            reply: ExchangeReplyAgent::Chat(ExchangeReplyAgentChat { reply }),
            parent_exchange_id,
        }
    }

    fn plan_reply(steps: Vec<Step>, parent_exchange_id: String) -> Self {
        Self {
            reply: ExchangeReplyAgent::Plan(ExchangeReplyAgentPlan {
                plan_steps: steps,
                plan_discarded: false,
            }),
            parent_exchange_id,
        }
    }

    fn edits_reply(edits_made: String, parent_exchange_id: String) -> Self {
        Self {
            reply: ExchangeReplyAgent::Edit(ExchangeReplyAgentEdit {
                edits_made_diff: edits_made,
                accepted: false,
            }),
            parent_exchange_id,
        }
    }

    fn tool_use(
        tool_input_partial: ToolInputPartial,
        tool_type: ToolType,
        thinking: String,
        parent_exchange_id: String,
        tool_use_id: String,
    ) -> Self {
        Self {
            reply: ExchangeReplyAgent::Tool(ExchangeReplyAgentTool {
                tool_type,
                tool_input_partial,
                thinking,
                tool_use_id,
            }),
            parent_exchange_id,
        }
    }
}

impl ExchangeTypeHuman {
    pub fn new(
        query: String,
        user_context: UserContext,
        project_labels: Vec<String>,
        repo_ref: RepoRef,
    ) -> Self {
        Self {
            query,
            user_context,
            project_labels,
            repo_ref,
        }
    }
}
    */

export type ExchangeTypeHuman = {
  query: string;
  user_context: UserContext;
  project_labels: string[];
  repo_ref: RepoRef;
};

export type ExchangeTypeAgent = {
  plan_steps: string[];
  plan_discarded: boolean;
  parent_exchange_id: string;
};
export type ExchangeType = ExchangeTypeHuman | ExchangeTypeAgent;

export type ExchangeState =
  | 'Accepted'
  | 'Rejected'
  | 'Cancelled'
  | 'Running'
  | 'UserMessage';
