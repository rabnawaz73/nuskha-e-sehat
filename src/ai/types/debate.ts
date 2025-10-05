import { z } from 'zod';

// Schema for user input to the debate flow
export const DebateInputSchema = z.object({
  symptom_text: z.string().describe('The user\'s description of their symptoms.'),
  user_lang: z.string().optional().default('ur').describe('User\'s preferred language (e.g., "ur", "en").'),
  age_bracket: z.string().optional().default('adult').describe('User\'s age bracket (e.g., "child", "adult", "senior").'),
});
export type DebateInput = z.infer<typeof DebateInputSchema>;


// Schema for a single turn in the debate (from Doctor or Herbalist)
const AgentTurnSchema = z.object({
    persona: z.enum(['doctor', 'herbalist']),
    summary: z.string().describe("1-line summary in the user's language."),
    recommendations: z.array(z.string()).describe('List of recommendations.'),
    urgency: z.enum(['low', 'watch', 'urgent']),
    confidence: z.number().min(0).max(1),
    sources: z.array(z.string()),
    explain_short: z.string().describe("1-2 sentence rationale in simple language."),
});
export type AgentTurn = z.infer<typeof AgentTurnSchema>;


// Schema for the Arbiter's final verdict
const ArbiterVerdictSchema = z.object({
    final_summary: z.string().describe("1-3 line user-facing summary."),
    final_recommendation: z.array(z.string()).describe('Synthesized list of recommendations.'),
    final_urgency: z.enum(['low', 'watch', 'urgent']),
    rationale: z.string().describe("1-2 sentences explaining the decision."),
    sources: z.array(z.string()),
    followup_question: z.string().optional().describe('An optional clarifying question for the user.'),
});
export type ArbiterVerdict = z.infer<typeof ArbiterVerdictSchema>;


// Schema for the complete debate result, returned by the main flow
export const DebateResultSchema = z.object({
    userInput: DebateInputSchema,
    doctorTurn: AgentTurnSchema,
    herbalistTurn: AgentTurnSchema,
    arbiterVerdict: ArbiterVerdictSchema,
});
export type DebateResult = z.infer<typeof DebateResultSchema>;
