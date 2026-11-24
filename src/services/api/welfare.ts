/**
 * Welfare assistant (maps to GET /api/welfare/schemes, POST /api/welfare/check).
 * Matching is against stored demo rules only and is phrased conservatively:
 * "may match the stored criteria", never "you are eligible".
 */
import { demoWelfareSchemes } from '@/data/welfare';
import { mockRequest } from '@/services/api/client';
import type { WelfareCheckRequest, WelfareMatch, WelfareScheme } from '@/types/domain';

const incomeLabel: Record<WelfareCheckRequest['incomeBand'], string> = {
  under_25k: 'under PKR 25,000 per month',
  '25k_50k': 'PKR 25,000 – 50,000 per month',
  '50k_100k': 'PKR 50,000 – 100,000 per month',
  over_100k: 'over PKR 100,000 per month',
  prefer_not_to_say: 'not specified',
};

export async function listWelfareSchemes(): Promise<WelfareScheme[]> {
  const result = await mockRequest(() => demoWelfareSchemes);
  if (!result.ok) throw result.error;
  return result.data;
}

export async function checkWelfareMatches(request: WelfareCheckRequest): Promise<WelfareMatch[]> {
  const result = await mockRequest(
    () => {
      const matches: WelfareMatch[] = [];

      for (const scheme of demoWelfareSchemes) {
        const matched: string[] = [];
        const unmatched: string[] = [];

        // District
        if (scheme.districts === 'all') {
          matched.push('Available in all districts');
        } else if (scheme.districts.includes(request.district)) {
          matched.push(`Available in ${request.district}`);
        } else {
          unmatched.push(`Not recorded as available in ${request.district}`);
        }

        // Household size
        if (
          (scheme.householdSizeMin === undefined || request.householdSize >= scheme.householdSizeMin) &&
          (scheme.householdSizeMax === undefined || request.householdSize <= scheme.householdSizeMax)
        ) {
          matched.push(`Household size (${request.householdSize}) is within the recorded range`);
        } else {
          unmatched.push('Household size is outside the recorded range');
        }

        // Income band
        if (scheme.incomeBands.includes(request.incomeBand)) {
          matched.push(
            request.incomeBand === 'prefer_not_to_say'
              ? 'Income band was not specified — the programme will assess it'
              : `Income band (${incomeLabel[request.incomeBand]}) is within the recorded range`,
          );
        } else {
          unmatched.push(`Income band (${incomeLabel[request.incomeBand]}) is outside the recorded range`);
        }

        if (matched.length >= 2 && unmatched.length === 0) {
          matches.push({
            scheme,
            matchedCriteria: matched,
            unmatchedCriteria: unmatched,
            matchStatement:
              'This programme may match the criteria you entered. Please confirm eligibility through the official programme — Sahara AI does not decide eligibility.',
          });
        } else if (matched.length >= 2) {
          matches.push({
            scheme,
            matchedCriteria: matched,
            unmatchedCriteria: unmatched,
            matchStatement:
              'Some stored criteria appear to match, but one criterion does not. The programme authority decides eligibility; check the programme’s own rules.',
          });
        }
      }

      return matches.sort((a, b) => b.matchedCriteria.length - a.matchedCriteria.length);
    },
    { latency: 800, failureRate: 0.08 },
  );

  if (!result.ok) throw result.error;
  return result.data;
}
