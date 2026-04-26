# Passport and Shells

## Summary

The Ronin Dojo platform is built on a single global identity (Passport) and multiple context-specific identities (Shells).

## Key Idea

One person → many contexts.

## Structure

- Passport = global identity
- Shells = context identities
  - Membership (organization + discipline)
  - Tournament participation

## Why it matters

Without shells, systems mix identity and context:

- rank becomes global when it is contextual
- organization identity leaks across contexts
- tournament history becomes mutable

## Relationships

- Passport → User
- Membership → Organization + Discipline
- RegistrationEntry → Division snapshot

## Sources

- SESSION_0002 schema design

## Open Questions

- Should RankAward always attach to Membership? (Currently RankAward links to User + Rank; Membership links to User + Org + Discipline + Rank. The connection is indirect via the user.)
