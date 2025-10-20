'use server';

/**
 * @fileOverview An AI agent for generating SEO-friendly metadata for product pages.
 *
 * - generateSeoMetadata - A function that generates SEO metadata for a product.
 * - GenerateSeoMetadataInput - The input type for the generateSeoMetadata function.
 * - GenerateSeoMetadataOutput - The return type for the generateSeoMetadata function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSeoMetadataInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  productDescription: z.string().describe('A detailed description of the product.'),
  keywords: z.string().describe('Comma separated keywords related to the product.'),
});
export type GenerateSeoMetadataInput = z.infer<
  typeof GenerateSeoMetadataInputSchema
>;

const GenerateSeoMetadataOutputSchema = z.object({
  title: z.string().describe('The SEO-friendly title for the product page.'),
  description: z
    .string()
    .describe('The SEO-friendly description for the product page.'),
});
export type GenerateSeoMetadataOutput = z.infer<
  typeof GenerateSeoMetadataOutputSchema
>;

export async function generateSeoMetadata(
  input: GenerateSeoMetadataInput
): Promise<GenerateSeoMetadataOutput> {
  return generateSeoMetadataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSeoMetadataPrompt',
  input: {schema: GenerateSeoMetadataInputSchema},
  output: {schema: GenerateSeoMetadataOutputSchema},
  prompt: `You are an SEO expert. Generate an SEO-friendly title and description for a product page, optimized for search engines.

Product Name: {{{productName}}}
Product Description: {{{productDescription}}}
Keywords: {{{keywords}}}

Title: (Concise, include main keyword, under 60 characters)
Description: (Engaging, include keywords, call to action, under 160 characters)`,
});

const generateSeoMetadataFlow = ai.defineFlow(
  {
    name: 'generateSeoMetadataFlow',
    inputSchema: GenerateSeoMetadataInputSchema,
    outputSchema: GenerateSeoMetadataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
