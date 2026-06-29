import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { HomePage } from "@/pages/home";
import { ClosetPage } from "@/pages/closet";
import { ClosetHealthPage } from "@/pages/closet-health";
import { OutfitsPage } from "@/pages/outfits";
import { SavedOutfitsPage } from "@/pages/outfits-saved";
import { WishlistPage } from "@/pages/wishlist";
import { PlannerPage } from "@/pages/planner";
import { SettingsPage } from "@/pages/settings";

const queryClient = new QueryClient();

function Router() {
  return (
    <AppShell>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/closet" component={ClosetPage} />
        <Route path="/closet-health" component={ClosetHealthPage} />
        <Route path="/outfits" component={OutfitsPage} />
        <Route path="/outfits/saved" component={SavedOutfitsPage} />
        <Route path="/wishlist" component={WishlistPage} />
        <Route path="/planner" component={PlannerPage} />
        <Route path="/settings" component={SettingsPage} />
      </Switch>
    </AppShell>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Router />
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
