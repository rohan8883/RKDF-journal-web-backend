// pagiation response function
export const paginationResponse = (data, page, limit) => {
  const { docs, totalDocs, totalPages } = data;
  return {
    data: docs,
    page,
    limit,
    totalDocs,
    totalPages
  };
};
