export const reportsConfig = {
  // Whether to enable reports
  enabled: true,

  // Whether to require sign in to report
  requireSignIn: false,

  // Report types
  reportTypes: ["BrokenLink", "WrongCategory", "Outdated", "Other"] as const,
  allReportTypes: ["BrokenLink", "WrongCategory", "Outdated", "Other", "Feedback"] as const,
  reportTypeLabels: {
    BrokenLink: "Broken Link",
    WrongCategory: "Wrong Category",
    Outdated: "Outdated",
    Other: "Other",
    Feedback: "Feedback",
  } as const,
}
