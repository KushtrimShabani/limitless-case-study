# Part A: Product Thinking

The request describes a solution ("block submit"), not the problem. From the three stakeholders I read two problems and one constraint:

- **Problem 1:** obvious suggestions get skipped, which causes extra review rounds.
- **Problem 2:** there is no record showing that suggestions were considered.
- **Constraint:** whatever we build must not slow down people who already work well.

A hard block on every suggestion is one way to solve this, but it is also the most expensive one for users. Before building it I want to know which problem matters most and how small the fix can be.

## 1. Questions I Would Ask

**About the problem**

1. What happened that led to this request? One incident, an audit finding, or a pattern over time?
2. Which outcome matters more: fewer review rounds, or proof that suggestions were considered? If you could only have one, which?
3. How will you decide the feature worked? For example: review rounds per item, or time to approval.

**About the rule itself**

4. What counts as a "response"? Accept and dismiss only, or does a dismiss need a reason?
5. Does it apply to every suggestion, or only to some types or severities?
6. Is a "dismiss all" action acceptable? If yes, does the audit trail still mean anything to you?
7. If the user edits the content after responding and new suggestions appear, must they respond again before submitting?
8. Should it apply to everyone in the workspace, or only to some teams or content types? Is there an override for urgent cases, and who can use it?

**About the audit trail**

9. Who reads it: the human reviewer, a compliance team, an external auditor?
10. What must it show (who, when, decision, reason), how long must it be kept, and does it need to be exported?

**Internal questions**

11. Engineering: do suggestions have stable IDs, or are they regenerated on each edit? Do we store any response state today?
12. Data/AI team: how often are suggestions wrong or irrelevant? If many are noise, forcing a response teaches people to click "dismiss" without reading.
13. Customer success: is this tied to a renewal or a deadline? Have other customers asked for the same thing?
14. Design: how many suggestions does a typical item have? Responding to 3 is fine, responding to 40 is not.

## 2. How I Would Gather More Information

**Data we already have**

- How many submissions today go out with at least one unanswered suggestion, and how many suggestions an item usually has.
- Whether items with ignored suggestions really get more review rounds. If the reviewer's rejection comments match the ignored suggestions, the first stakeholder is right. If not, a block won't reduce review rounds.
- Which suggestion types are accepted most and ignored most. This shows what "obvious" means in practice.
- The same numbers for this customer compared to others.

**Product behaviour**

- Go through the flow myself with realistic content and count the clicks needed to respond to every suggestion.
- Check what happens to suggestions when content is edited, and what we log today.

**People**

- The account manager or CS contact for this customer: the original wording, who asked (a buyer or a daily user), and the context.
- Support tickets and old feature requests that mention suggestions, review rounds or audit.
- One or two human reviewers: what an unnecessary review round looks like to them.
- An engineer who knows the suggestion model, for a rough cost of each option.
- Three to five users from other customers, for a short call on why they skip suggestions.

**Other sources**

- How similar tools solve it. GitHub's "Require conversation resolution before merging" is the closest pattern I know: it is set per repository, not as a global rule.
- The customer's industry. If it is regulated, the rules may already say what evidence is needed.

**A cheap experiment**

Behind a flag, show a soft warning on submit ("4 suggestions have no response") for a few workspaces. If the unanswered rate drops a lot with a warning only, a hard block may not be needed.

At the end of the week I would write one page: what we found, the option I recommend, and the questions still open for the customer.

## 3. Developer Ready Ticket

**Title:** Require a response to every AI suggestion before submitting for review (workspace setting)

**Why**

Users can submit content without responding to AI suggestions. This causes avoidable review rounds, and there is no record that suggestions were considered. One customer has asked for submission to be blocked until every suggestion has a response.

**What we are building**

A workspace setting, off by default. When it is on, a user cannot submit for review until every open suggestion has a response. Each response is stored and shown to the reviewer.

Making it a setting keeps friction away from workspaces that don't want the rule.

**Acceptance criteria**

1. A workspace admin can turn "Require responses to AI suggestions" on or off. Default: off. With the setting off, nothing changes.
2. A response is either **Accept** or **Dismiss**. Dismiss has an optional reason (free text).
3. With the setting on, Submit is disabled while any open suggestion has no response. The UI shows how many are left ("3 suggestions need a response") and a link that jumps to the first one.
4. The rule is enforced on the server. The submit endpoint rejects the request and returns the IDs of unanswered suggestions. The UI check alone is not enough.
5. If the content is edited and new suggestions are generated, the new ones need a response. Responses to unchanged suggestions are kept. A suggestion whose text no longer exists is closed as "outdated" and does not block.
6. Every response is stored with: suggestion ID, content version, user ID, decision, reason, timestamp. Records are append-only. Changing a decision adds a new record.
7. The reviewer sees a summary on the review screen ("12 accepted, 3 dismissed") and can open the list with reasons.
8. While suggestions are still being generated, Submit is disabled with a clear message. If generation fails, the user can submit and the record says suggestions were unavailable.
9. The disabled Submit explains why to keyboard and screen reader users.
10. Events are tracked: submit blocked, suggestion accepted, suggestion dismissed, and time from first suggestion shown to submit.

**Out of scope for this ticket**

- "Dismiss all" or other bulk actions (see open question 1).
- Rules per suggestion type or severity.
- Exporting the audit trail.
- An admin override for urgent submissions.
- A "warn only" mode.

**Assumptions**

- A1. Suggestions have stable IDs across edits. If not, criterion 5 needs extra work first.
- A2. Accept and Dismiss are enough. No third state such as "ask the reviewer".
- A3. A dismiss reason is optional.
- A4. The rule applies to all content types in the workspace.
- A5. Content already submitted before the setting is turned on is not affected.

**Open questions**

| #   | Question                                                                  | Owner              | Blocks start? |
| --- | ------------------------------------------------------------------------- | ------------------ | ------------- |
| 1   | Is "dismiss all" allowed? It lowers friction but weakens the audit trail. | Product + customer | No            |
| 2   | Is a dismiss reason required?                                             | Customer           | No            |
| 3   | Do suggestions have stable IDs?                                           | Engineering        | Yes           |
| 4   | How long must response records be kept?                                   | Compliance         | No            |
| 5   | What should happen when suggestion generation fails (criterion 8)?        | Product            | No            |

**Dependencies**

- Suggestion service: stable IDs and an "outdated" state.
- Workspace settings: a place for the new setting and its permission check.
- Review screen: space for the response summary.
- Design: blocked state, counter, dismiss reason input.
- Analytics: new events.

**Estimate**

Rough, because I don't know the codebase. It assumes A1 holds.

| Part                                     | Days     |
| ---------------------------------------- | -------- |
| Data model and response storage          | 2        |
| Server-side check on submit              | 1        |
| Workspace setting                        | 1        |
| Suggestion response UI and submit gating | 3        |
| Reviewer summary                         | 1.5      |
| Tests and QA                             | 2        |
| **Total**                                | **10.5** |

About two weeks for one engineer.

**Rollout**

Behind a feature flag. Turn it on for the requesting customer first, then review the numbers after two weeks.

**How we know it worked**

- Review rounds per item go down for workspaces with the setting on.
- Time to submit does not grow by more than an agreed amount.
- Guardrail: if most dismissals happen within a second or two of each other, people are clicking through and the audit trail is not worth much. That is the signal to revisit open question 1 and the quality of the suggestions.
