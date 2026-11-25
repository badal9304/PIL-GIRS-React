import { getJson } from '@/shared/api';
import { publicUrl } from '@/shared/lib/basePath';
import { searchIndexDtoSchema, toSearchItems, type SearchItem } from '../model/searchIndex';

/** The published search index (loaded on first use, outside the main bundle). */
export async function fetchSearchItems(): Promise<SearchItem[]> {
  const dto = await getJson(publicUrl('/data/search-index.json'), searchIndexDtoSchema);
  return toSearchItems(dto);
}
