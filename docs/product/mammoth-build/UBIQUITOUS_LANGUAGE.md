---
title: "Mammoth Build Ubiquitous Language"
slug: mammoth-build-ubiquitous-language
type: concept
status: active
created: 2026-07-18
updated: 2026-07-18
last_agent: codex-session-0570
pairs_with:
  - docs/product/mammoth-build/PRD.md
  - docs/product/mammoth-build/STORIES.md
  - docs/business/leads/mammoth-build-michael-flores.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - mammoth-build
  - ubiquitous-language
  - brand-heartbeat
  - sales
  - installation
---

# Mammoth Build Ubiquitous Language

Product-specific language for the Mammoth sales, delivery, installation, and enablement experience.
These definitions govern product copy, workflow labels, SOPs, stories, automation, and completion gates.

## Brand language

| Term | Definition | Aliases to avoid |
| --- | --- | --- |
| **Product North Star** | Know every prospect personally, make the next action effortless, and carry every building opportunity through delivery and a satisfied installation without dropping the relationship. | CRM goal, automation goal |
| **Brand Heartbeat (BHB)** | The felt Mammoth experience: capable, personal, proud, educational, enjoyable, cohesive, efficient, smooth, and reliable. | Theme, vibe |
| **Soul of Sales** | Know the customer personally and passionately deliver the right next step through the entire relationship. | Sales style, sales script |
| **Mission** | Help people build with confidence by carrying every project from its first conversation through delivery and a satisfied installation. | Vision, slogan |
| **Brand Motto** | **Built all the way through.** | “We don't quote, ship, and disappear” as the primary headline |
| **Internal Mantra** | **Know the customer. Carry the build. Finish proud.** | Motto when speaking to customers |
| **Microdelight** | A restrained, useful moment of clarity, encouragement, progress, or celebration that makes work feel easier without becoming childish or distracting. | Gamification, decoration |

## People and commercial records

| Term | Definition | Aliases to avoid |
| --- | --- | --- |
| **Prospect** | A person or company identified for outreach that has not yet shown or confirmed interest. | Lead |
| **Lead** | A prospect with a recorded interaction, inquiry, or qualification signal that Mammoth has accepted into its sales workflow. | Raw row, contact |
| **Contact** | A person and their communication details, independent of whether they currently have a building opportunity. | Lead, user |
| **Customer** | A person or organization with a confirmed order or active post-order relationship. | User, account |
| **Opportunity** | The sales lifecycle for a possible building purchase, from accepted Lead through confirmed or lost outcome. | Project, deal |
| **Project** | A confirmed building order moving through engineering, fabrication, delivery, installation, and satisfaction. | Lead, opportunity |
| **Activity** | A dated, owned call, email, meeting, note, or task connected to a Contact and/or Opportunity. | Attempt, event |
| **Contact Attempt** | An Activity whose purpose is reaching a Prospect or Lead; “Attempt 1/2/3” is sequence position, not pipeline stage. | ATC stage |
| **Next Action** | The single owned action that prevents a live Opportunity or Project from being silently dropped. | Reminder, note |

## Fulfillment and installation

| Term | Definition | Aliases to avoid |
| --- | --- | --- |
| **Confirmed Order** | An accepted commercial commitment with an order number; necessary but not sufficient for a Successful Close. | Won, complete |
| **Installation Path** | The explicitly selected responsibility model: **Mammoth-Installed** or **Customer-Installed**. | Install type, fulfillment mode |
| **Mammoth-Installed** | Mammoth's team owns erection/installation through proof, issue resolution, and customer satisfaction. | Full service |
| **Customer-Installed** | The customer owns erection/installation while Mammoth owns readiness, education, guidance, support, and satisfaction follow-through. | DIY, self-service |
| **Install Readiness** | The verified prerequisites, safety information, documents, tools, sequence, roles, and support contacts required before installation begins. | Delivery complete |
| **Satisfied Installation** | The selected installation path is complete, required proof exists, and the customer confirms satisfaction or an owned resolution task remains open. | Installed, done |
| **Successful Close** | The building is delivered, its Installation Path reaches Satisfied Installation, required proof is captured, and no concern is left without an owner and Next Action. | Order confirmed, delivery, complete |
| **Resolution Task** | An owned Next Action that keeps a concern open until the customer can confirm satisfaction. | Ticket, complaint |

## Education and enablement

| Term | Definition | Aliases to avoid |
| --- | --- | --- |
| **Enablement System** | The brand-specific set of onboarding, SOPs, protocols, wizards, guides, and role-based how-tos that makes a successful outcome repeatable. | Help docs, knowledge base |
| **SOP** | A versioned standard operating procedure with purpose, prerequisites, steps, safety boundaries, proof, and escalation. | Guide, checklist |
| **Protocol** | A rule-governed interaction across people or systems, including responsibilities, handoffs, and stop conditions. | SOP |
| **Step-by-Step Guide** | A task-specific instructional sequence written for the person performing the work. | SOP, article |
| **Onboarding Wizard** | A guided, stateful flow that establishes prerequisites, explains why, captures choices, and leaves the user ready for the next stage. | Form, tour |
| **Role How-To** | A concise instruction for one job role at one lifecycle stage. | Generic documentation |

## Relationships

- A **Contact** may participate in many **Opportunities**; an **Opportunity** has one primary **Contact**.
- A qualified/accepted **Lead** becomes an **Opportunity**; a raw purchased row remains a **Prospect** until accepted.
- A **Confirmed Order** promotes the commercial **Opportunity** into an operational **Project**.
- Every live **Opportunity** and **Project** has one owned **Next Action**.
- Every delivered **Project** has exactly one **Installation Path**.
- Both **Installation Paths** must reach the same **Satisfied Installation** standard.
- A **Customer-Installed** Project requires an **Enablement System** appropriate to its building and stage.
- A concern blocks **Successful Close** unless it has an owned **Resolution Task**.

## Example dialogue

> **Dev:** “The quote was accepted and the order number exists. Can we mark the Project complete?”
>
> **Domain expert:** “No. That is a **Confirmed Order**, not a **Successful Close**. Which
> **Installation Path** did the customer choose?”
>
> **Dev:** “Customer-Installed. Delivery is confirmed and the readiness wizard is complete.”
>
> **Domain expert:** “Then keep the **Project** open until the required proof is captured and the customer
> confirms a **Satisfied Installation**, or create an owned **Resolution Task** for anything unresolved.”

## Flagged ambiguities

- **Lead / Prospect:** purchased or scraped rows were called Leads. Canonical recommendation: they are
  **Prospects** until Mammoth accepts them into a human follow-up workflow.
- **Deal / Opportunity / Project:** use **Opportunity** before a Confirmed Order and **Project** afterward.
  The current Prisma `Project` model spans both for implementation simplicity; UI language should still
  preserve the domain distinction.
- **Attempt 1/2/3 / ATC-001:** treat these as **Contact Attempt** sequence positions, not pipeline stages,
  unless Michael explicitly ratifies a different sales workflow.
- **Complete:** the existing pipeline ends at delivery/order completion. Canonically, **Successful Close**
  requires Satisfied Installation.
- **Customer-Installed / DIY:** avoid “DIY”; it understates Mammoth's ongoing enablement and support duty.
- **Mammoth Loyalty C:** unresolved transcription fragment; do not promote it into product language yet.
