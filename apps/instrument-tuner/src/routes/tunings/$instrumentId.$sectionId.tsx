import { createRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, Pause, Play } from "lucide-react";
import { Card, CardContent } from "@hudak/ui";
import { Button } from "@hudak/ui";
import { Route as rootRoute } from "../__root";
import { RouteThemeSettings } from "../../components/RouteThemeSettings";
import { TunerPageHeader } from "../../components/TunerPageHeader";
import { useReferenceTonePlayer } from "../../hooks/use-reference-tone-player";
import {
  getInstrumentById,
  getSectionById,
} from "../../utils/tuning-navigation";
import { TuningBreadcrumbs } from "../../components/TuningBreadcrumbs";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/tunings/$instrumentId/$sectionId",
  component: SectionTuningsPage,
});

function SectionTuningsPage() {
  const { instrumentId, sectionId } = Route.useParams();
  const instrument = getInstrumentById(instrumentId);
  const section = getSectionById(instrumentId, sectionId);
  const navigate = useNavigate();
  const { playSequence, playingKey, sequenceKey, startTone, stopTone } =
    useReferenceTonePlayer();
  const recoveryLink = instrument
    ? {
        to: "/tunings/$instrumentId" as const,
        params: { instrumentId: instrument.id },
        label: "Back to sections",
      }
    : {
        to: "/tunings" as const,
        params: undefined,
        label: "Back to tunings",
      };

  if (!instrument || !section) {
    return (
      <div className="bg-tuner-shell min-h-screen">
        <div className="container mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
          <Card className="tuner-card-surface w-full gap-0 border py-0 motion-safe:animate-[tuner-fade-up_220ms_ease-out]">
            <CardContent className="space-y-3 p-6 text-center sm:p-8">
              <h1 className="text-2xl font-semibold tracking-tight">
                Section not found
              </h1>
              <p className="text-sm text-muted-foreground">
                The selected tuning section could not be loaded for this
                instrument.
              </p>
              <div className="pt-2">
                <Button asChild variant="outline" className="gap-2">
                  <Link
                    to={recoveryLink.to}
                    params={recoveryLink.params as never}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    {recoveryLink.label}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-tuner-shell min-h-screen">
      <div className="container mx-auto max-w-6xl space-y-6 px-4 py-5 motion-safe:animate-[tuner-fade-up_220ms_ease-out] sm:space-y-8 sm:px-6 sm:py-8 lg:px-8">
        <TunerPageHeader
          subtitle={`${instrument.name} · ${section.name} tunings`}
          actions={<RouteThemeSettings />}
        />

        <TuningBreadcrumbs
          items={[
            { label: "Tunings", to: "/tunings" },
            {
              label: instrument.name,
              to: "/tunings/$instrumentId",
              params: { instrumentId: instrument.id },
            },
            { label: section.name },
          ]}
        />

        <div className="space-y-4 sm:space-y-5">
          {section.tunings.map((tuning) => (
            <Card
              key={tuning.id}
              className="tuner-card-surface gap-0 border py-0"
            >
              <CardContent className="space-y-5 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-lg font-semibold leading-tight">
                      {tuning.name}
                    </p>
                    <p className="text-sm tracking-[0.08em] text-muted-foreground/90">
                      {[...tuning.notes]
                        .sort((a, b) => b.string - a.string)
                        .map((note) => note.name)
                        .join(" ")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      className="border-border/70 bg-background/72 shadow-xs hover:border-primary/24 hover:bg-background/92"
                      aria-label={
                        sequenceKey === tuning.id
                          ? `Stop preview for ${tuning.name}`
                          : `Preview ${tuning.name}`
                      }
                      title={
                        sequenceKey === tuning.id
                          ? `Stop preview for ${tuning.name}`
                          : `Preview ${tuning.name}`
                      }
                      onClick={() =>
                        playSequence(
                          tuning.notes.map((note) => ({
                            frequency: note.frequency,
                            key: `${tuning.id}-${note.string}`,
                            string: note.string,
                          })),
                          { key: tuning.id },
                        )
                      }
                    >
                      {sequenceKey === tuning.id ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="default"
                      size="icon-sm"
                      className="shadow-sm shadow-primary/25"
                      aria-label={`Use ${tuning.name}`}
                      title={`Use ${tuning.name}`}
                      onClick={() =>
                        navigate({
                          to: "/",
                          search: { tuning: tuning.id } as never,
                        })
                      }
                    >
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Play a string or preview the full tuning.</span>
                  <span>{tuning.notes.length} strings</span>
                </div>
                <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-6">
                  {[...tuning.notes]
                    .sort((a, b) => a.string - b.string)
                    .map((note) => {
                      const noteKey = `${tuning.id}-${note.string}`;
                      const isPlaying = playingKey === noteKey;

                      return (
                        <button
                          key={noteKey}
                          type="button"
                          onPointerDown={(event) => {
                            event.preventDefault();
                            void startTone(note.frequency, {
                              key: noteKey,
                              stringNumber: note.string,
                            });
                          }}
                          onPointerUp={stopTone}
                          onPointerLeave={stopTone}
                          onPointerCancel={stopTone}
                          onKeyDown={(event) => {
                            if (event.key === " " || event.key === "Enter") {
                              event.preventDefault();
                              void startTone(note.frequency, {
                                key: noteKey,
                                stringNumber: note.string,
                              });
                            }
                          }}
                          onKeyUp={(event) => {
                            if (event.key === " " || event.key === "Enter") {
                              stopTone();
                            }
                          }}
                          className={`tuner-note-button tuner-note-surface relative rounded-xl border px-2 py-3 text-center ${
                            isPlaying
                              ? "tuner-note-active"
                              : ""
                          }`}
                          aria-label={`Play string ${note.string}, ${note.name}, ${Math.round(note.frequency)} hertz`}
                          style={{ touchAction: "none" }}
                        >
                          <div className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                            S{note.string}
                          </div>
                          <div className="mt-1 text-base font-semibold">
                            {note.name}
                          </div>
                          <div className="mt-1 text-[11px] text-muted-foreground">
                            {Math.round(note.frequency)} Hz
                          </div>
                        </button>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Link
          to="/tunings/$instrumentId"
          params={{ instrumentId }}
          className="inline-flex items-center gap-2 rounded-md py-2 text-sm font-medium text-primary/90 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sections
        </Link>
      </div>
    </div>
  );
}
