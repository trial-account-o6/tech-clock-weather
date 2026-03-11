const defaultTzResolver = () => Intl.DateTimeFormat().resolvedOptions().timeZone;
const defaultOffsetResolver = (date) => date.getTimezoneOffset();

const timeFormatterCache = new Map();

function getTimeFormatter(timeZone) {
  const key = timeZone || "__default__";
  if (!timeFormatterCache.has(key)) {
    timeFormatterCache.set(
      key,
      new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone,
      })
    );
  }
  return timeFormatterCache.get(key);
}

export function formatTime(date, options = {}) {
  const { timeZone } = options;
  return getTimeFormatter(timeZone).format(date);
}

export function formatDate(date, options = {}) {
  const { timeZone } = options;
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  });

  const parts = formatter.formatToParts(date);
  const values = parts.reduce((acc, part) => {
    acc[part.type] = part.value;
    return acc;
  }, {});

  const year = values.year || "0000";
  const month = values.month || "00";
  const day = values.day || "00";
  const weekday = (values.weekday || "---").toUpperCase();
  return `${year}/${month}/${day} [${weekday}]`;
}

export function formatUTCDate(date) {
  return formatDate(date, { timeZone: "UTC" });
}

export function getTimezone(
  date = new Date(),
  tzResolver = defaultTzResolver,
  offsetResolver = defaultOffsetResolver
) {
  const timezone = tzResolver(date);
  const offset = offsetResolver(date);
  const totalMinutes = Math.abs(offset);
  const hours = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
  const minutes = String(totalMinutes % 60).padStart(2, "0");
  const sign = offset <= 0 ? "+" : "-";
  return `${timezone} (UTC${sign}${hours}:${minutes})`;
}

export function buildClockSnapshot(date = new Date(), options = {}) {
  const { tzResolver = defaultTzResolver, offsetResolver = defaultOffsetResolver } = options;
  const localTime = formatTime(date);
  const localDate = formatDate(date);
  const localZone = getTimezone(date, tzResolver, offsetResolver);
  const utcTime = formatTime(date, { timeZone: "UTC" });
  const utcDate = formatUTCDate(date);
  const footerTime = `${utcTime.slice(0, 5)} UTC`;

  return {
    localTime,
    localDate,
    localZone,
    utcTime,
    utcDate,
    footerTime,
  };
}

export function renderClocks(snapshot, elements = {}) {
  const {
    localTimeEl,
    localDateEl,
    localZoneEl,
    utcTimeEl,
    utcDateEl,
    footerTimeEl,
  } = elements;

  if (localTimeEl) localTimeEl.textContent = snapshot.localTime;
  if (localDateEl) localDateEl.textContent = snapshot.localDate;
  if (localZoneEl) localZoneEl.textContent = snapshot.localZone;
  if (utcTimeEl) utcTimeEl.textContent = snapshot.utcTime;
  if (utcDateEl) utcDateEl.textContent = snapshot.utcDate;
  if (footerTimeEl) footerTimeEl.textContent = snapshot.footerTime;
}

export function updateClocks(elements = {}, options = {}) {
  const {
    now = () => new Date(),
    tzResolver = defaultTzResolver,
    offsetResolver = defaultOffsetResolver,
  } = options;
  const currentDate = typeof now === "function" ? now() : now;
  const snapshot = buildClockSnapshot(currentDate, { tzResolver, offsetResolver });
  renderClocks(snapshot, elements);
  return snapshot;
}

export function getClockElements(root = document) {
  const query = (id) => {
    if (typeof root.getElementById === "function") {
      return root.getElementById(id);
    }
    return root.querySelector ? root.querySelector(`#${id}`) : null;
  };

  return {
    localTimeEl: query("local-time"),
    localDateEl: query("local-date"),
    localZoneEl: query("local-zone"),
    utcTimeEl: query("utc-time"),
    utcDateEl: query("utc-date"),
    footerTimeEl: query("footer-time"),
  };
}
