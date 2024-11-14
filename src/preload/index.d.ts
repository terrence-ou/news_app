import { LoadTodayHeadlines, GetHeadlinesFn } from "@shared/types";

// Type definition for the preload process
declare global {
  interface Window {
    context: {
      getHeadlines: GetHeadlinesFn;
      loadTodayHeadlines: LoadTodayHeadlines;
    };
  }
}