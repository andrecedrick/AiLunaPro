import type { RegistryFilters, RegistryItem } from '../../types/registry';

/** Pure filter — used by RegistryPage. */
export function filterRegistry(
  items: RegistryItem[],
  filters: RegistryFilters,
): RegistryItem[] {
  const search = filters.search.trim().toLowerCase();
  return items.filter(item => {
    if (filters.department !== 'all' && item.department !== filters.department) return false;
    if (filters.risk !== 'all' && item.riskLevel !== filters.risk) return false;
    if (filters.approvalStatus !== 'all' && item.approvalStatus !== filters.approvalStatus)
      return false;
    if (search.length > 0) {
      const haystack = `${item.toolName}\n${item.purpose}\n${item.department}\n${item.notes}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });
}
