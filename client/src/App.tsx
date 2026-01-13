import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import LandingPage from "./pages/LandingPage";
import Home from "./pages/Home";
import Automation from "./pages/Automation";
import Agents from "./pages/Agents";
import AgentForm from "./pages/AgentForm";
import Tasks from "./pages/Tasks";
import TaskForm from "./pages/TaskForm";
import Crews from "./pages/Crews";
import CrewForm from "./pages/CrewForm";
import Executions from "./pages/Executions";
import ExecutionForm from "./pages/ExecutionForm";
import ExecutionDetail from "./pages/ExecutionDetail";
import Tools from "./pages/Tools";
import Analytics from "./pages/Analytics";
import NotFound from "./pages/NotFound";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={LandingPage} />
      <Route path={"/dashboard"} component={Home} />
      <Route path={"/automation"} component={Automation} />
      <Route path={"/agents"} component={Agents} />
      <Route path="/agents/new" component={AgentForm} />
      <Route path="/agents/:id/edit" component={AgentForm} />
      <Route path="/tasks" component={Tasks} />
      <Route path="/tasks/new" component={TaskForm} />
      <Route path="/tasks/:id/edit" component={TaskForm} />
      <Route path="/crews" component={Crews} />
      <Route path="/crews/new" component={CrewForm} />
      <Route path="/crews/:id/edit" component={CrewForm} />
      <Route path="/executions" component={Executions} />
      <Route path="/executions/new" component={ExecutionForm} />
      <Route path="/executions/:id" component={ExecutionDetail} />
      <Route path="/tools" component={Tools} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
