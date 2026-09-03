# MyBetOracle V3 Performance and Results UI

Status: Consolidated after product review

## Route Ownership

- `/{locale}/results` owns accumulator wins, settled predictions and compact
  performance analysis in one destination.
- `/{locale}/performance` permanently redirects to Results.

Accumulator Results is the default tab. Prediction Results and Performance
Summary are secondary tabs. Aggregate counts and ledger records must never
come from separate calculations.

## Trust Rules

- Every hit rate displays its settled sample size.
- Hit rate is wins divided by decided picks; voids remain visible but are
  excluded from the denominator.
- Oracle Score bands show observed historical results. They are not presented
  as calibrated probabilities or guarantees.
- Published odds are historical context, not a profit or investment claim.
- Published picks remain visible after settlement as won, lost or void.
- Multi-Pick performance is separated by daily/weekly scope and odds target.

## Prototype Boundary

Mock records are deterministic and isolated behind `PerformanceService`.
Integration replaces the service implementation after UI approval without
changing the presentation contract.
