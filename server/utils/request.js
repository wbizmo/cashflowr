import mongoose from "mongoose";

export const isValidId = (value) => mongoose.isValidObjectId(value);

export const parsePagination = (query = {}, defaults = {}) => {
  const defaultLimit = defaults.limit || 25;
  const maxLimit = defaults.maxLimit || 100;
  const parsedPage = Number.parseInt(query.page, 10);
  const parsedLimit = Number.parseInt(query.limit, 10);
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const limit = Number.isFinite(parsedLimit) && parsedLimit > 0
    ? Math.min(parsedLimit, maxLimit)
    : defaultLimit;

  return { page, limit, skip: (page - 1) * limit };
};

export const pick = (source = {}, fields = []) => {
  const result = {};
  for (const field of fields) {
    if (Object.prototype.hasOwnProperty.call(source, field)) result[field] = source[field];
  }
  return result;
};

export const parseExpectedVersion = (req) => {
  const raw = req.get?.("If-Match") ?? req.body?.version;
  if (raw === undefined || raw === null || raw === "") return null;
  const normalized = String(raw).replace(/^W\//, "").replaceAll('"', "");
  const version = Number.parseInt(normalized, 10);
  return Number.isInteger(version) && version >= 0 ? version : NaN;
};

export const paginationMeta = ({ page, limit, total }) => ({
  page,
  limit,
  total,
  pages: Math.max(Math.ceil(total / limit), 1),
  hasNextPage: page * limit < total,
  hasPreviousPage: page > 1,
});

export const parseDateRange = (query = {}, maxMonths = 60) => {
  const now = new Date();
  const defaultFrom = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1));
  const defaultTo = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  const from = query.from ? new Date(query.from) : defaultFrom;
  const toInput = query.to ? new Date(query.to) : defaultTo;
  const to = query.to ? new Date(toInput.getTime() + 24 * 60 * 60 * 1000) : toInput;

  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from >= to) return null;

  const maxMs = maxMonths * 31 * 24 * 60 * 60 * 1000;
  if (to - from > maxMs) return null;
  return { from, to };
};
