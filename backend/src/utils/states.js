export const BookingStatus = Object.freeze({
  PENDING: "pending",
  BROADCASTING: "broadcasting",
  ACCEPTED: "accepted",
  EN_ROUTE: "en_route",
  ARRIVED: "arrived",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  FAILED: "failed",
});

export const BookingStatusList = Object.values(BookingStatus);

export const TerminalStatuses = new Set([
  BookingStatus.COMPLETED,
  BookingStatus.CANCELLED,
  BookingStatus.FAILED,
]);

// Allowed forward transitions. Cancellation is special-cased below.
const TRANSITIONS = {
  [BookingStatus.PENDING]: [BookingStatus.BROADCASTING, BookingStatus.CANCELLED, BookingStatus.FAILED],
  [BookingStatus.BROADCASTING]: [BookingStatus.ACCEPTED, BookingStatus.CANCELLED, BookingStatus.FAILED],
  [BookingStatus.ACCEPTED]: [BookingStatus.EN_ROUTE, BookingStatus.CANCELLED],
  [BookingStatus.EN_ROUTE]: [BookingStatus.ARRIVED, BookingStatus.CANCELLED],
  [BookingStatus.ARRIVED]: [BookingStatus.IN_PROGRESS, BookingStatus.CANCELLED],
  [BookingStatus.IN_PROGRESS]: [BookingStatus.COMPLETED],
  [BookingStatus.COMPLETED]: [],
  [BookingStatus.CANCELLED]: [],
  [BookingStatus.FAILED]: [],
};

export function canTransition(from, to) {
  const allowed = TRANSITIONS[from];
  if (!allowed) return false;
  return allowed.includes(to);
}

export function assertTransition(from, to) {
  if (!canTransition(from, to)) {
    const err = new Error(`Illegal booking transition: ${from} -> ${to}`);
    err.status = 409;
    err.code = "ILLEGAL_TRANSITION";
    throw err;
  }
}

export function isTerminal(status) {
  return TerminalStatuses.has(status);
}
