'use server';
/**
 * @fileOverview This file implements a Genkit flow for providing personalized respiratory risk assessments.
 *
 * - assessPersonalizedRisk - A function that handles the personalized risk assessment process.
 * - PersonalizedRiskAssessmentInput - The input type for the assessPersonalizedRisk function.
 * - PersonalizedRiskAssessmentOutput - The return type for the assessPersonalizedRisk function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PersonalizedRiskAssessmentInputSchema = z.object({
  userType: z.enum(['normal', 'patient']).describe("The user's health profile: 'normal' or 'patient'."),
  city: z.string().describe("The user's current city for context."),
  aqi: z.number().describe('The current Air Quality Index (AQI).'),
  pm25: z.number().optional().describe('Particulate Matter (PM2.5) concentration.'),
  no2: z.number().optional().describe('Nitrogen Dioxide (NO2) concentration.'),
  o3: z.number().optional().describe('Ozone (O3) concentration.'),
  co: z.number().optional().describe('Carbon Monoxide (CO) concentration.'),
  so2: z.number().optional().describe('Sulfur Dioxide (SO2) concentration.'),
  predictedAqiTrend: z
    .string()
    .describe('A brief description of the predicted AQI trend (e.g., "expected to rise slightly", "stable", "expected to drop significantly").'),
});
export type PersonalizedRiskAssessmentInput = z.infer<typeof PersonalizedRiskAssessmentInputSchema>;

const PersonalizedRiskAssessmentOutputSchema = z.object({
  riskLevel: z.enum(['low', 'moderate', 'high', 'severe']).describe('The overall respiratory risk level.'),
  assessment: z.string().describe('A detailed explanation of the current respiratory risk, considering AQI and pollutants.'),
  actionableAdvice: z.string().describe('Specific, actionable advice tailored to the user type and risk level.'),
});
export type PersonalizedRiskAssessmentOutput = z.infer<typeof PersonalizedRiskAssessmentOutputSchema>;

const personalizedRiskAssessmentPrompt = ai.definePrompt({
  name: 'personalizedRiskAssessmentPrompt',
  input: { schema: PersonalizedRiskAssessmentInputSchema },
  output: { schema: PersonalizedRiskAssessmentOutputSchema },
  prompt: `You are an AI-powered AeroGuard health advisor, specialized in providing clear, personalized respiratory risk assessments.

Based on the following data, assess the user's current respiratory risk, explain what the local AQI and predicted trends mean for their specific health profile, and offer actionable advice.

User Profile:
- User Type: {{{userType}}}

Location and Air Quality Data:
- City: {{{city}}}
- Current AQI: {{{aqi}}}
{{#if pm25}}- PM2.5: {{{pm25}}} µg/m³{{/if}}
{{#if no2}}- NO2: {{{no2}}} µg/m³{{/if}}
{{#if o3}}- O3: {{{o3}}} µg/m³{{/if}}
{{#if co}}- CO: {{{co}}} ppm{{/if}}
{{#if so2}}- SO2: {{{so2}}} µg/m³{{/if}}
- Predicted AQI Trend: {{{predictedAqiTrend}}}

Guidelines for Assessment:
- For 'normal' users, use standard health thresholds.
- For 'patient' users (e.g., with respiratory conditions), apply stricter thresholds and provide more cautious advice.
- Consider the current AQI, individual pollutant levels, and the predicted trend when determining the 'riskLevel'.
- The 'riskLevel' should be one of: 'low', 'moderate', 'high', 'severe'.
- The 'assessment' should explain why the risk level was assigned, mentioning relevant pollutants and trends.
- The 'actionableAdvice' should be practical and specific, considering the user's type and the prevailing conditions.

Provide the response in the specified JSON format.`,
});

const personalizedRiskAssessmentFlow = ai.defineFlow(
  {
    name: 'personalizedRiskAssessmentFlow',
    inputSchema: PersonalizedRiskAssessmentInputSchema,
    outputSchema: PersonalizedRiskAssessmentOutputSchema,
  },
  async (input) => {
    const { output } = await personalizedRiskAssessmentPrompt(input);
    return output!;
  },
);

export async function assessPersonalizedRisk(
  input: PersonalizedRiskAssessmentInput,
): Promise<PersonalizedRiskAssessmentOutput> {
  return personalizedRiskAssessmentFlow(input);
}
