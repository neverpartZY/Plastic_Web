'use client'

import { create } from 'zustand'

interface FilterStore {
  selectedTags: string[]
  sortBy: 'latest' | 'popular'
  currentPage: number
  searchQuery: string
  toggleTag: (slug: string) => void
  setTags: (slugs: string[]) => void
  clearAll: () => void
  setSort: (sort: 'latest' | 'popular') => void
  setPage: (page: number) => void
  setSearch: (q: string) => void
}

export const useFilterStore = create<FilterStore>((set) => ({
  selectedTags: [],
  sortBy: 'latest',
  currentPage: 1,
  searchQuery: '',

  toggleTag: (slug) =>
    set((state) => {
      const exists = state.selectedTags.includes(slug)
      return {
        selectedTags: exists
          ? state.selectedTags.filter((t) => t !== slug)
          : [...state.selectedTags, slug],
        currentPage: 1,
      }
    }),

  setTags: (slugs) => set({ selectedTags: slugs, currentPage: 1 }),

  clearAll: () => set({ selectedTags: [], currentPage: 1, searchQuery: '' }),

  setSort: (sort) => set({ sortBy: sort, currentPage: 1 }),

  setPage: (page) => set({ currentPage: page }),

  setSearch: (q) => set({ searchQuery: q, currentPage: 1 }),
}))
