import { useState } from 'react';

export type Page = 'home' | 'accounting' | 'accounting-table' | 'evolution';

export function useNavigation() {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  const navigateTo = (page: Page) => {
    setCurrentPage(page);
  };

  return {
    currentPage,
    navigateTo,
  };
}