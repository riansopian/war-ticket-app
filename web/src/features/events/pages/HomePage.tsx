import { Info, LogIn, Menu } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import { ErrorState, LoadingState } from "@/components/shared/AsyncStates";
import { ScreenCard, ScreenHeader } from "@/components/shared/ScreenCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/app/routes";
import { useServices } from "@/app/ServicesContext";
import type { Event } from "@/domain/types";
import { useAsync } from "@/hooks/useAsync";
import { getErrorMessage } from "@/lib/errors";
import { YourQueueSection } from "@/features/session/YourQueueSection";
import { EventList } from "../components/EventList";

/** 9.1 Home Page — FR-01…FR-05. */
export function HomePage() {
  const { events } = useServices();
  const navigate = useNavigate();
  const location = useLocation();
  const notice = (location.state as { notice?: string } | null)?.notice;
  const { data, error, loading, reload } = useAsync(() => events.list(), [events]);

  const handleBuy = (event: Event) => navigate(ROUTES.waitingRoom(event.id));

  return (
    <ScreenCard
      header={
        <ScreenHeader
          icon={<Menu className="size-4" />}
          title="Rusuh Booking Tiket"
          right={
            <Button
              variant="ghost"
              size="sm"
              className="text-header-foreground hover:bg-white/10 hover:text-header-foreground"
            >
              <LogIn /> Login
            </Button>
          }
        />
      }
    >
      {notice ? (
        <Alert variant="warning">
          <Info className="size-4" />
          <AlertDescription>{notice}</AlertDescription>
        </Alert>
      ) : null}

      <YourQueueSection />

      <h2 className="text-sm font-semibold text-muted-foreground">
        Daftar Event
      </h2>
      {loading && !data ? <LoadingState label="Memuat event…" /> : null}
      {error ? (
        <ErrorState message={getErrorMessage(error)} onRetry={reload} />
      ) : null}
      {data ? <EventList events={data} onBuy={handleBuy} /> : null}
    </ScreenCard>
  );
}
