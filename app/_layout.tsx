import { Stack } from "expo-router";
import {QueryClient} from "@tanstack/query-core";
import {QueryClientProvider} from "@tanstack/react-query";

const queryClient = new QueryClient()

export default function RootLayout() {
  return (
      <QueryClientProvider client={queryClient}>
          <Stack
              screenOptions={{
                  headerShown: false
              }}
          />
      </QueryClientProvider>

  );
}
