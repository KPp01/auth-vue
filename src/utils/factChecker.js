import axios from 'axios';
import { tokenize } from './tokenizer';
import { getTopNTokens } from './tokenizer';

const FACT_CHECK_API_URL = 'https://factchecktools.googleapis.com/v1alpha1/claims:search';
const API_KEY = process.env.FACT_CHECK_API_KEY;

export async function checkFactualAccuracy(text) {
  const tokens = tokenize(text);
  const topKeywords = getTopNTokens(tokens, 5);

  const claims = extractClaims(text);
  const factCheckResults = await Promise.all(claims.map(claim => checkClaim(claim)));

  return {
    overallAccuracy: calculateOverallAccuracy(factCheckResults),
    checkedClaims: factCheckResults,
    topKeywords,
    confidence: calculateConfidence(factCheckResults),
  };
}

function extractClaims(text) {
  // This is a simplified claim extraction. In a real-world scenario,
  // you might use NLP techniques to identify statements that can be fact-checked.
  return text.split('.').filter(sentence => sentence.trim().length > 10);
}

async function checkClaim(claim) {
  try {
    const response = await axios.get(FACT_CHECK_API_URL, {
      params: {
        key: API_KEY,
        query: claim,
      },
    });

    const factCheckResult = response.data.claims[0];
    return {
      claim,
      claimReview: factCheckResult ? {
        publisher: factCheckResult.claimReview[0].publisher.name,
        url: factCheckResult.claimReview[0].url,
        rating: factCheckResult.claimReview[0].textualRating,
      } : null,
      accuracy: calculateClaimAccuracy(factCheckResult),
    };
  } catch (error) {
    console.error('Error checking claim:', error);
    return {
      claim,
      claimReview: null,
      accuracy: 0,
      error: 'Failed to check this claim',
    };
  }
}

function calculateClaimAccuracy(factCheckResult) {
  if (!factCheckResult) return 0;
  // This is a simplified accuracy calculation. You might want to implement
  // a more nuanced approach based on the specific ratings from your fact-checking source.
  const rating = factCheckResult.claimReview[0].textualRating.toLowerCase();
  if (rating.includes('true')) return 1;
  if (rating.includes('mostly true')) return 0.75;
  if (rating.includes('mixed')) return 0.5;
  if (rating.includes('mostly false')) return 0.25;
  if (rating.includes('false')) return 0;
  return 0.5;  // Default to 0.5 if we can't determine accuracy
}

function calculateOverallAccuracy(factCheckResults) {
  const accuracies = factCheckResults.map(result => result.accuracy);
  return accuracies.reduce((sum, accuracy) => sum + accuracy, 0) / accuracies.length;
}

function calculateConfidence(factCheckResults) {
  const checkedClaims = factCheckResults.filter(result => result.claimReview !== null);
  return checkedClaims.length / factCheckResults.length;
}

export function suggestFactCheckImprovements(factCheckResults) {
  const suggestions = [];

  if (factCheckResults.confidence < 0.5) {
    suggestions.push('Consider providing more specific, verifiable claims to improve fact-checking accuracy.');
  }

  const lowAccuracyClaims = factCheckResults.checkedClaims.filter(claim => claim.accuracy < 0.5);
  if (lowAccuracyClaims.length > 0) {
    suggestions.push(`Review and possibly revise the following claims: ${lowAccuracyClaims.map(claim => claim.claim).join(', ')}`);
  }

  return suggestions;
}