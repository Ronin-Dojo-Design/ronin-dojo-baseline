/**
 * SANITIZED lead-sheet fixtures — invented people, `example.com` addresses,
 * 555-01xx phone numbers. Shared by the ingest unit tests and the /app/leads
 * "load sample" buttons so both exercise the exact same paths.
 *
 * G-021 boundary: NEVER put real lead data (or anything resembling it) in this
 * file. Every dedupe/issue path below is exercised deliberately:
 *   - rows 1+4: same email, different casing → duplicate_in_sheet
 *   - rows 2+6: same phone, different formatting → duplicate_in_sheet
 *   - row 5: no email or phone → issue, undedupable
 *   - row 7: unrecognized source "Facebook" → mapped to Other + issue; its phone
 *     also matches SANITIZED_EXISTING_CONTACTS' Quinn Baker after normalization
 *     (+1 (555) 010-0150 ≡ 555-010-0150) → existing_contact when that index is used
 *   - row 8: quoted field containing a comma (CSV escaping path)
 */

import type { ExistingContact } from "./lead-ingest";

export const SANITIZED_LEAD_SHEET_CSV = `Name,Email,Phone,Company,Lead Source,Notes
Alex Rivera,alex.rivera@example.com,(555) 010-0134,Rivera Ag Supply,Referral,40x60 equipment shed
Bailey Chen,bailey.chen@example.com,555-010-0177,Chen Auto Works,Web form,Asked for quote follow-up
Casey Okafor,casey.okafor@example.com,,Okafor Storage,Phone,Called about pricing
ALEX.RIVERA@example.com dupe,ALEX.RIVERA@EXAMPLE.COM,,Rivera Ag Supply,Trade show,Same person as row 1
Dana Whitfield,,,Whitfield Farms,Word of mouth,No contact details captured
Bailey C. (cell),bc.alt@example.com,+1 555 010 0177,Chen Auto Works,Email,Same phone as row 2
Emerson Vega,emerson.vega@example.com,555-010-0150,Vega Fabrication,Facebook,Source not in vocabulary
"Finley, Harper & Co",finley.harper@example.com,555-010-0161,"Finley, Harper & Co",Trade Show,"Wants a Quonset, 40x60"
`;

export const SANITIZED_LEAD_SHEET_JSON = JSON.stringify(
  [
    {
      company: "Rivera Ag Supply",
      email: "alex.rivera@example.com",
      leadSource: "referral",
      name: "Alex Rivera",
      notes: "JSON twin of the CSV row 1 lead",
      phone: "(555) 010-0134",
    },
    {
      "Lead Source": "web form",
      email: "gray.sutton@example.com",
      name: "Gray Sutton",
      phone: "555-010-0188",
    },
    {
      email: "harlow.diaz@example.com",
      name: "Harlow Diaz",
      notes: "No source key at all",
    },
  ],
  null,
  2,
);

/** A pretend CRM contact index for tests (the app fetches the real one). */
export const SANITIZED_EXISTING_CONTACTS: ExistingContact[] = [
  {
    email: "casey.okafor@example.com",
    id: "contact-casey",
    name: "Casey Okafor",
    phone: null,
  },
  {
    email: "quinn.baker@example.com",
    id: "contact-quinn",
    name: "Quinn Baker",
    phone: "+1 (555) 010-0150",
  },
];
