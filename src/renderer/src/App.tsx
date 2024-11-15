import Headlines from "./routes/headlines";
import Root from "./routes/root";
import Folders from "./routes/folders";
import Editor from "./routes/eidtor";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { Articles } from "@shared/models/Articles";

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Root />,
      children: [
        { index: true, element: <Navigate to="headlines" /> },
        {
          path: "headlines",
          element: <Headlines />,
          loader: async () => {
            let todayHeadlines =
              await window.context.loadTodayHeadlines();
            if (todayHeadlines === undefined) {
              todayHeadlines = new Articles([]);
            }
            let prevHeadlines =
              await window.context.loadPrevHeadlines();
            if (prevHeadlines === undefined) {
              prevHeadlines = new Articles([]);
            }
            return { todayHeadlines, prevHeadlines };
          },
        },
        { path: "folders", element: <Folders />, children: [] },
        { path: "editor", element: <Editor />, children: [] },
      ],
    },
  ],
  {
    future: {
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_relativeSplatPath: true,
      v7_skipActionErrorRevalidation: true,
    },
  }
);

const App = () => {
  return (
    <RouterProvider
      router={router}
      future={{ v7_startTransition: true }}
    />
  );
};

export default App;
