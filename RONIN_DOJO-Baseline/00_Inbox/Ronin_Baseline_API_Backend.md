You are a perfect one task at a time coding agent.  Slow it down, do it well.  The path to perfection is rooted in patience, precision, and as always, Planned Passion Produces purpose.   You exist to create Ronin Dojo Design, the member hub buYou think calmly and precisely, effectively and efficient, thinking about  
1. Intent about task  
-What does the user need from this task?  I am in need a directory site for users to find members/other users, those users are martial arts members who need to register for tournaments of different types of martial art tournaments, but all use the same profile passport, but have different ranks, roles, member status in different shells.

  

There is one simple shell for the overall app, like tiny menu bar on MacOS which is small, quick, lightweight, but has the full features and functionality the dev or admin or designer would need to (from left to right, for example like Mac style  would have a tiny red button, yellow button, and green button  
2. This planning session, is where the architecture, the logic is hidden in there ,and database, mySQL and

Got it. Let’s treat this as a planning/architecture session and lock down the core structure first: the Passport identity, the Shells (contexts), and a MySQL data model that supports:

- A directory where people can find other members
- Tournament registration across different martial arts tournaments
- One shared profile “Passport”, but different ranks / roles / statuses depending on which “shell” (dojo/organization, discipline, tournament) you’re operating inside
- A lightweight MacOS-style “menu bar shell” UI that can collapse/expand, while still giving admins/devs full capability

Below is a solid “foundation architecture” that you can build on without redoing the database later.

  

1) Core idea: Passport + Shells

Passport (global identity)

A user has one identity across the entire platform:

- Who they are (name, photo)
- Contact & emergency info
- Date of birth (for age divisions)
- Waivers / consent
- Directory visibility preferences

This Passport is not tied to any single dojo, league, or tournament.

Shells (context-specific identities)

A “Shell” is a context where the same person has different attributes:

Examples of shells:

1. Organization Shell (dojo/league/school)

- member status: invited / pending / active / suspended / expired
- roles: member, coach, judge, admin
- rank: belt/kyu/dan/whatever system that org uses for a given discipline

3. Discipline Shell (Karate vs BJJ vs TKD)

- rank systems differ by discipline
- you can be a brown belt in BJJ and 2nd dan in Karate (or vice versa)

5. Tournament Shell

- registration status
- competitor vs coach vs judge role for that tournament
- your rank needs to be snapshotted at registration time so later promotions don’t rewrite history

This model solves your requirement:

“Same profile passport, but different ranks, roles, member status in different shells.”

  

2) Domain model (the nouns that matter)

If we keep the nouns clean, your app stays clean.

Primary entities

- User (login/account)
- Passport (global profile)
- Organization (dojo/league)
- Discipline (Karate/BJJ/TKD/etc.)
- Rank System + Rank (belt lists, dan lists, etc. — per discipline)
- Membership (User ↔ Organization ↔ Discipline, including rank/status)
- Tournament
- Tournament Discipline (tournament supports one or more disciplines/rulesets)
- Division (age/weight/rank/gender categories)
- Registration (user signs up for tournament)
- Registration Entry (user enters specific division(s) and role(s))

Why “Registration Entry” matters

One registration can include multiple entries:

- Sparring division + forms division
- Competitor role in one, coach role in another
- Different fees per division

  

3) Permissions model (practical + scalable)

You’ll want RBAC with scope:

- Global roles (system admin)
- Organization roles (dojo admin, coach)
- Tournament roles (tournament admin, judge coordinator)

Simplest scalable approach:

- A global roles table
- A join table for organization membership roles
- A join table for tournament staff/roles (optional in MVP)

This gives you the flexibility to add granular permissions later without tearing up the schema.

  

4) MySQL schema (MVP foundation)

Below is a clean MVP schema that directly maps to your requirements. It avoids over-engineering while still supporting future growth.

Notes:

- Use InnoDB, utf8mb4
- Use DATETIME(6) timestamps for good auditability
- Use BIGINT UNSIGNED IDs to avoid running out later

Users (login) + Passport (global identity)
****
[[CREATE TABLE users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  is_email_verified BOOLEAN NOT NULL DEFAULT 0,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE passports (
  user_id BIGINT UNSIGNED PRIMARY KEY,
  display_name VARCHAR(120) NOT NULL,
  legal_first_name VARCHAR(120) NULL,
  legal_last_name VARCHAR(120) NULL,
  dob DATE NULL,
  gender ENUM('female','male','nonbinary','prefer_not_to_say') NULL,
  phone_e164 VARCHAR(20) NULL,
  emergency_contact_name VARCHAR(200) NULL,
  emergency_contact_phone_e164 VARCHAR(20) NULL,
  avatar_url VARCHAR(1024) NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT fk_passports_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;]]




https://chatgpt.com/s/t_69e45e6739d081919fe50e04a856bee5



Yes — I got it started in a way that’s meant to be thorough now and easy to extend later.

I created a pre-filled workbook here:

- [Ronin Pods Exposure Matrix — Actual Fill v1.xlsx](sandbox:/mnt/data/Ronin_Pods_Exposure_Matrix_Actual_Fill_v1.xlsx?_chatgptios_conversationID=69a9ffbd-67e0-832e-87f3-61bf61ba69e7&_chatgptios_messageID=0dcc65c2-d10a-4dc9-b20b-6bd615176689)




What’s inside

It uses what we already defined and leaves room to keep growing:

- Overview
- Pods Exposure Matrix
- Pod Fields Matrix
- Relationships Matrix
- Styles & Approvals
- Org Chart Backbone
- Mental Models & Mermaid

Why this version is useful

It is not just a blank checklist. It is already pre-populated with:

- the Pods we’ve already planned
- the field-level review items we already know
- relationship planning for techniques, curriculum, styles, and lineage
- org chart backend field planning
- Mermaid / BJJ Mental Models-style backlog starters

So you can use it now for ronindojodesign.local, and keep adding rows as new Pods, fields, or relationships appear.

JETTY

JETTY: This actual-fill workbook exists so the reference site can start with real pre-filled backend review structure instead of a blank sheet, while still staying easy to extend as the system grows.

Best next move

Use this workbook together with:

- the Phase 5.8 rollout plan
- the reference site workbook
- the companion checklist pack

And once you start creating Pods on ronindojodesign.local, we can turn this from a planned sheet into a site-truth sheet by updating:

- current status
- evidence URLs/screenshots
- approved for rollout
- actual field exposure decisions


The next best step is to stop making new planning artifacts and start Phase 5.8 on the real ronindojodesign.local site.

Why that’s the right move: the backend foundation is already broad enough to prove in a real environment — custom tables, services, REST, and GraphQL are all in place, including tournament logic like eligibility, snapshots, idempotency, and capacity handling. The biggest remaining unknown is no longer architecture; it is real WordPress environment behavior on your actual Local stack.  

So I’d do this next, in this exact order:

1. Create the clean Local site at ronindojodesign.local.
2. Run Sprint A and Sprint B from the rollout plan:

- confirm WP admin/front end loads
- record WP/PHP/MySQL versions
- install only the minimum stack: Ronin plugin, Pods, WPGraphQL, auth plugin if needed, Query Monitor

4. Run Sprint C immediately after:

- activate Ronin
- verify schema install
- verify seeds

6. Then open the new workbook and start the actual-fill process while creating the first Pods:

- tournament_content
- technique_library
- curriculum

That is the highest-value next step because it turns all the planning into truth and reveals the real blockers fast.

One important thing to watch first: the earlier review found a real WPDB nullable-field risk in repository writes, especially around style/rank and registration references. That means when you activate and test the first real site, schema verification and first-write behavior are more important than making more docs.  

So the shortest honest answer is:

Next best step = create ronindojodesign.local and begin Sprint A–C of Phase 5.8 right now.