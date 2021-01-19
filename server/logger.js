const { Logger } = require("tslog");

const log = new Logger({
  name: "checkout",
  exposeStack: false,
  displayFilePath: "hidden",
  displayFunctionName: false,
  displayLoggerName: false,
  dateTimeTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  dateTimePattern: "year-month-day hour:minute:second",
});

module.exports = log;