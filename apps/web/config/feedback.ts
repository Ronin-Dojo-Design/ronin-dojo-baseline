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
}
