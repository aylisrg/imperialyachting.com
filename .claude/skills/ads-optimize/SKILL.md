---
name: ads-optimize
description: Review and improve the Imperial Yachting Meta ad account through the meta-ads MCP server. Use when asked to check the ads, analyse ad performance, decide what to pause or scale, diagnose a spike in CPC/CPM, or act on a daily ads report. Covers Facebook/Instagram campaigns, ad sets, ads, budgets and creatives.
---

# Meta Ads optimization

Работа с рекламным кабинетом Imperial Yachting через Meta Ads MCP (`meta-ads`).

## Business context you must hold

- Luxury yacht charter and management, Dubai Harbour. High ticket, low volume: one booking pays for weeks of spend, so **cost per result beats CTR** every time.
- **The conversion happens off Meta.** People click through and then message on WhatsApp. Meta's reported conversions are always an undercount — never conclude an ad "doesn't convert" from Meta data alone. Cross-check `/api/ads/reports` (GA4 side: `site_signals`).
- Season matters: Dubai charter demand peaks roughly October–April. A soft July is not a broken campaign.
- Audience: HNWIs and tourists in Dubai, corporate/event planners, wedding and birthday charters.

## The daily loop

1. **Read yesterday's automated report first** — `GET /api/ads/reports?limit=2`. It already holds Meta's numbers, the anomalies and the GA4 cross-check. Do not re-derive what is already there.
2. **Pull live data** with the MCP tools for anything the report leaves open:
   - `ads_get_ad_entities` — campaigns/ad sets/ads with spend, impressions, CTR, conversions.
   - `ads_insights_performance_trend` — direction of CPC, CPM, CTR, cost per result.
   - `ads_insights_anomaly_signal` — sudden breaks in delivery.
   - `ads_get_opportunity_score` — Meta's own 0–100 score plus its recommendations.
   - `ads_insights_auction_ranking_benchmarks` / `ads_insights_industry_benchmark` — is it us or the auction?
   - `ads_insights_advertiser_context` — funnel/objective sanity check.
3. **Decide** using the judgement rules below.
4. **Propose before you touch anything.** See Guardrails.
5. **Record the outcome** — update the matching row in `ads_recommendations` (status `applied` / `rejected`, with a note) so tomorrow's report is not blind to what changed.

## Judgement rules

- **Thin data is not a signal.** Under ~1000 impressions or ~50 link clicks for an ad, the verdict is `watch`. Do not pause or scale on a handful of clicks — at this account's volume a single day proves almost nothing.
- **Frequency > 3 with falling CTR** = creative fatigue. Refresh the creative; do not narrow targeting.
- **Rising CPM with stable CTR** = auction pressure (season, competitors), not our creative.
- **Rising CPC with falling CTR** = our creative or our audience. That one is ours to fix.
- **Zero results but healthy CTR and traffic** — suspect tracking before creative. Check `site_signals.utm_tagging_detected` and whether WhatsApp clicks moved in GA4.
- **Budget moves are incremental**: ±20–30% at a time. Doubling a budget resets learning and wastes a day.
- Prefer two decisive actions over ten small ones.

## Guardrails

- **Never change budgets, statuses, targeting or creatives without explicit approval in this conversation.** Present the proposal — entity, current state, exact change, expected effect — and wait.
- **Never pause an ad on a single day of data.** Require at least 3 days or a clear statistical gap.
- Never raise total account spend beyond what the user has agreed to. If a proposal increases daily spend, say the new daily total in the proposal.
- Reading is always fine: pull whatever data you need without asking.
- If a tool is unavailable or errors, say so plainly and continue with what you have — do not silently fill the gap with an estimate.

## Recurring things worth checking

- **UTM tags on every ad URL** (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content` with the ad name). Without them GA4 cannot tell which ad produced the WhatsApp enquiry, and the whole loop runs blind. This is the highest-value fix whenever it is missing.
- Landing page match: a "yacht party" ad should land on the relevant fleet or charter page, not the homepage.
- Whether the campaign objective still matches the funnel — messaging/leads objectives usually beat traffic for this business.
