# MyBetOracle V3 Retention and Viral Product System

Status: Launch foundation approved for UI prototyping

## Product Loop

The primary return loop is:

```text
Discover -> Save or Follow -> Receive relevant update -> Return to context
         -> Check settlement -> Share verified receipt
```

Time spent is not the goal by itself. The product should make the next useful
football decision easy to find and give users a reason to return at the right
moment.

## Saved Objects

The canonical saved entities are matches, published predictions, published
Multi-Picks, teams and competitions. Markets can become followable after the
initial launch. Saved state must synchronize across web and mobile after
authentication is integrated.

`/{locale}/saved` is the personal return center. Its default Matches view
answers what is live, what starts next and what is awaiting settlement. Other
views own saved Multi-Picks, followed entities and notification preferences.

## Notification Events

Launch-relevant events are kickoff reminder, confirmed lineup, material Oracle
update, prediction settlement, complete Multi-Pick settlement, morning digest
and evening recap. Users control each category and eventually per-team or
per-match settings. Campaign frequency, quiet hours and deduplication are
mandatory integration requirements.

No alert may claim certainty or disguise promotional content as a result
update. A notification must deep-link to the exact match, slip or result.

## Viral Objects

Shareable content is an immutable product receipt, not a generic advert:

- pre-kickoff Oracle pick receipt
- published Multi-Pick receipt
- verified winning Multi-Pick receipt
- evidence-backed streak card
- transparent weekly record

Every receipt contains the MyBetOracle brand, locale, publication state and a
deep link to the exact source. Winning cards retain the original picks and odds.
The web prototype provides the share sheet and preview contract; image rendering
and native share integration follow during application integration.

## Responsible Engagement

- No artificial loss-chasing prompts, countdown pressure or guaranteed-win copy.
- No notification is enabled without a visible preference control.
- Historical accuracy and streaks always retain sample context.
- Referral rewards, if introduced, cannot depend on betting losses or deposits.

## Launch Metrics

Measure saved-item activation, seven-day return rate, alert opt-in by category,
alert-to-context open rate, settlement return rate, share initiation, successful
deep-link opens and notification mute/unsubscribe rate. Raw session duration is
diagnostic, not the primary success metric.

## Delivery Sequence

1. Saved and Watchlists UI and state contract.
2. Persistent save/follow API plus anonymous-to-account migration.
3. Notification preference storage and event delivery.
4. Deep-link routing for all saved and shared objects.
5. Server-rendered localized share cards and native share integration.
6. Digest personalization and measured iteration.
