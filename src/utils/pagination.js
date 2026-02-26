// utils/pagination.js

export function getPagination(query) {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export function paginate(items, page, limit, total) {
  return {
    data: items,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export function buildFilter(query, searchableFields = []) {
  const filter = {
    deletedAt: { $exists: false },
  };

  // Generic search across multiple fields
  if (query.search) {
    filter.$or = searchableFields.map((field) => ({
      [field]: { $regex: query.search, $options: "i" },
    }));
  }

  // Add status filter if it's not "all"
  if (query.status && query.status !== "all") {
    filter.status = query.status;
  }

  return filter;
}
