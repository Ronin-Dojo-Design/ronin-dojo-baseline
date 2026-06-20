export const feedbackConfig = {
  // Whether to enable feedback
  enabled: true,

  // The thresholds for showing the feedback widget
  thresholds: {
    minTimeSpent: 60, // Minimum time spent on the page (in seconds)
    minPageView: 3, // Minimum number of page views
    minScroll: 66, // Minimum scroll percentage
    timeCheckInterval: 5, // How often to check the engagement (in seconds)
  },

  // Route prefixes where the engagement toast must NOT appear. These pages render a
  // FIXED full-width bottom CTA on mobile (e.g. the lineage/join wizard's "Join the
  // Legacy" bar — app/(web)/lineage/join/.../join-legacy-wizard/index.tsx), and the
  // bottom-corner sonner toast would sit on top of it on a ~390px viewport, covering
  // the primary conversion CTA. Suppressing here keeps the funnel clean (SESSION_0420).
  suppressOnPathPrefixes: ["/lineage/join"],
}
