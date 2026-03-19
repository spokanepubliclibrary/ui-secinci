export default function buildQueryString(
    filtersOrFull = {},
    sort = '',
    dir  = 'asc'
  ) {
    // support old signature: buildQueryString({ a:1, b:2 })
    const filters = typeof filtersOrFull === 'object' && !Array.isArray(filtersOrFull)
      ? filtersOrFull
      : {};

    const p = new URLSearchParams();

    // canonical order
    Object.keys(filters).sort().forEach(k => {
      const v = filters[k];
      if (v !== undefined && v !== null && v !== '') p.set(k, v);
    });

    // if (sort) p.set('sort', sort);
    // if (dir)  p.set('dir',  dir);

    if (sort !== '') {
      p.set('sort', sort); // only when column name is supplied
      if (dir) p.set('dir', dir) // then only add dir
    }

    return p.toString();
}
