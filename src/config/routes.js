import PSNTrophiesPage from "../pages/PSNTrophiesPage";
import GameCompaniesPage from "../pages/GameCompaniesPage";
import GameIPsPage from "../pages/GameIPsPage";
import W40KPage from "../pages/W40KPage";
import W30KPage from "../pages/W30KPage";
import AccountsPage from "../pages/AccountsPage";
import MomentsPage from "../pages/MomentsPage";
import DefaultPage from "../pages/DefaultPage";

export const routeConfig = {
  "psn-trophies": PSNTrophiesPage,
  "psn-companies": GameCompaniesPage,
  "psn-ips": GameIPsPage,
  "warhammer-40k": W40KPage,
  "warhammer-30k": W30KPage,
  "xkailive-account": AccountsPage,
  "xkailive-moments": MomentsPage,
  default: DefaultPage,
};
