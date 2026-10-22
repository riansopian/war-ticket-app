import * as React from "react";

import { AppRouter } from "./app/AppRouter";
import { ServicesProvider } from "./app/ServicesContext";
import { createMockServices } from "./services/mock";

export function App() {
  const services = React.useMemo(() => createMockServices(), []);

  return (
    <ServicesProvider services={services}>
      <AppRouter />
    </ServicesProvider>
  );
}

export default App;
