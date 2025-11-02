import { create } from 'zustand';
import type { WebsiteContent } from '@shared/types';
import { api } from '@/lib/api-client';
interface ContentState {
  content: WebsiteContent | null;
  isLoading: boolean;
  fetchContent: () => Promise<void>;
  setContent: (newContent: WebsiteContent) => void;
}
export const useContentStore = create<ContentState>((set, get) => ({
  content: null,
  isLoading: true,
  fetchContent: async () => {
    if (get().content) {
      set({ isLoading: false });
      return; // Avoid refetching if content is already there
    }
    set({ isLoading: true });
    try {
      const contentData = await api<WebsiteContent>('/api/content');
      set({ content: contentData, isLoading: false });
    } catch (error) {
      console.error("Failed to fetch website content:", error);
      set({ isLoading: false });
    }
  },
  setContent: (newContent: WebsiteContent) => {
    set({ content: newContent });
  },
}));