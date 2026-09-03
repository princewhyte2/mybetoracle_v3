import type { AccumulatorLeg, AccumulatorResult } from "@/features/accumulators/types";

export type BetslipHistoryItem = {
  id: string;
  date: string;
  totalOdds: number;
  selections: number;
  result: Exclude<AccumulatorResult, "PENDING">;
};

export type DailyBetslip = {
  id: string;
  date: string;
  timezone: string;
  targetMinimum: number;
  targetMaximum: number;
  totalOdds: number;
  status: "PUBLISHED" | "SETTLED";
  result: AccumulatorResult;
  generatedAt: string;
  legs: AccumulatorLeg[];
  history: BetslipHistoryItem[];
};

export interface BetslipService {
  getDaily(query: { date: string; timezone: string }): Promise<DailyBetslip>;
}
