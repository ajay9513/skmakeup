import { FilterQuery, SortOrder } from 'mongoose';
import { ListQueryInput } from '@sk-makeup/shared';
import { escapeRegex } from './escape-regex';

export interface ParsedListQuery {
  page: number;
  limit: number;
  skip: number;
  sort: Record<string, SortOrder>;
  search?: string;
}

export function parseListQuery(query: ListQueryInput): ParsedListQuery {
  const page = query.page;
  const limit = query.limit;
  const skip = (page - 1) * limit;

  const sort: Record<string, SortOrder> = {};
  if (query.sort) {
    const desc = query.sort.startsWith('-');
    const field = desc ? query.sort.slice(1) : query.sort;
    sort[field] = desc ? -1 : 1;
  } else {
    sort.createdAt = -1;
  }

  return { page, limit, skip, sort, search: query.search };
}

export function buildSearchFilter(
  search: string | undefined,
  fields: string[],
): FilterQuery<unknown> {
  if (!search?.trim()) return {};

  const escaped = escapeRegex(search.trim());

  return {
    $or: fields.map((field) => ({
      [field]: { $regex: escaped, $options: 'i' },
    })),
  };
}

export function softDeleteFilter(): FilterQuery<unknown> {
  return { deletedAt: { $exists: false } };
}
