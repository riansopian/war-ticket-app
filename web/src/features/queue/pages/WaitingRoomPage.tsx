import { Hourglass, Info } from "lucide-react";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { ROUTES } from "@/app/routes";
import { useServices } from "@/app/ServicesContext";
import { ErrorState, LoadingState } from "@/components/shared/AsyncStates";
import { ScreenCard, ScreenHeader } from "@/components/shared/ScreenCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAsync } from "@/hooks/useAsync";
import { getErrorMessage } from "@/lib/errors";
import { QueuePositionPanel } from "../components/QueuePositionPanel";
import { WaitTimePanel } from "../components/WaitTimePanel";
import { useQueue } from "../useQueue";

/** 9.2 Waiting Room — FR-06…FR-10 (+ boleh ditinggalkan, BRAINSTORM §3.3). */
export function WaitingRoomPage() {
  const { eventId = "" } = useParams();
  const navigate = useNavigate();
  const { events } = useServices();
  const { data: event } = useAsync(() => events.get(eventId), [events, eventId]);
  const { status, error, rejoin } = useQueue(eventId);

  // FR-08: auto-redirect ke Booking saat giliran tiba.
  useEffect(() => {
    if (status?.state === "ADMITTED") {
      navigate(ROUTES.booking(eventId), { replace: true });
    }
  }, [status?.state, eventId, navigate]);

  const goHome = () => navigate(ROUTES.home);
  const header = (
    <ScreenHeader
      icon={<Hourglass className="size-4" />}
      title="Ruang Tunggu"
      right={event?.name.split(" — ")[0]}
    />
  );

  if (error) {
    return (
      <ScreenCard header={header}>
        <ErrorState
          message={getErrorMessage(error)}
          action={<Button onClick={goHome}>Kembali ke Home</Button>}
        />
      </ScreenCard>
    );
  }

  if (!status || status.state === "NONE" || status.state === "ADMITTED") {
    return (
      <ScreenCard header={header}>
        <LoadingState
          label={status?.state === "ADMITTED" ? "Giliran Anda tiba…" : "Masuk antrian…"}
        />
      </ScreenCard>
    );
  }

  if (status.state === "EXPIRED") {
    return (
      <ScreenCard header={header}>
        <Alert variant="warning">
          <Info className="size-4" />
          <AlertDescription>
            Waktu booking Anda sudah habis. Silakan antre kembali.
          </AlertDescription>
        </Alert>
        <div className="flex gap-2">
          <Button onClick={rejoin}>Antre lagi</Button>
          <Button variant="outline" onClick={goHome}>
            Kembali ke Home
          </Button>
        </div>
      </ScreenCard>
    );
  }

  const progress =
    ((status.initialPosition - status.position) / status.initialPosition) * 100;

  return (
    <ScreenCard header={header}>
      <QueuePositionPanel position={status.position} />
      <WaitTimePanel etaSeconds={status.etaSeconds} />
      <Progress
        value={progress}
        aria-label="Kemajuan antrian"
      />
      <p className="text-center text-sm text-muted-foreground">
        Anda akan otomatis masuk saat giliran tiba. Boleh meninggalkan halaman
        ini; lanjutkan kapan saja lewat <strong>Antrian Anda</strong> di Home.
      </p>
      <Button variant="outline" className="w-full" onClick={goHome}>
        Kembali ke Home
      </Button>
    </ScreenCard>
  );
}
