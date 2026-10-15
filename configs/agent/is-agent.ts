// Mirror of scripts/checklist.sh.
const agentEnvVars = [
    "AI_AGENT",
    "CLAUDECODE",
    "CLAUDE_CODE",
    "CURSOR_AGENT",
    "CODEX_SANDBOX",
    "CODEX_THREAD_ID",
    "GEMINI_CLI",
    "COPILOT_CLI",
]

export const isAgent =
    process.env.AGENT === "true" || agentEnvVars.some(name => Boolean(process.env[name]))
