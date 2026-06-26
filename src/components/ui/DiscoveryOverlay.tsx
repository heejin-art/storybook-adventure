"use client";

import { useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { discoveryStore } from "@/components/world/discoveryStore";
import { profile } from "@/data/profile";
import { careerJourney, careerSummary } from "@/data/career";
import { notalk, todaypop, type Project } from "@/data/projects";
import { business, future, ending } from "@/data/story";

/**
 * 발견 콘텐츠 — "그림책 페이지" 패널.
 * 장소의 마커/오브젝트를 클릭하면 열리고(스크롤 멈춤), 차분히 읽은 뒤
 * "계속 둘러보기"로 닫으면 다시 산책이 이어진다.
 * 반투명 패널이 어떤 배경(낮/밤)에서도 글이 또렷이 보이게 한다.
 */
export function DiscoveryOverlay() {
  const active = useSyncExternalStore(
    discoveryStore.subscribe,
    discoveryStore.getSnapshot,
    () => null,
  );

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          onClick={() => discoveryStore.close()}
          className="pointer-events-auto fixed inset-0 z-30 flex items-center justify-center px-6"
          style={{ background: "rgba(28,26,22,0.32)" }}
        >
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 26, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xl rounded-[30px] border border-clay/30 bg-cream/90 px-9 py-8 text-left shadow-[0_30px_80px_-30px_rgba(40,34,26,0.7)] backdrop-blur-md md:px-12 md:py-10"
          >
            <Content id={active} />

            <button
              type="button"
              onClick={() => discoveryStore.close()}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-forest px-7 py-3 font-display text-base text-cream shadow-md transition-colors hover:bg-[#5f9459]"
            >
              계속 둘러보기 →
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Content({ id }: { id: string }) {
  if (id === "about") {
    return (
      <>
        <Label>{profile.fullName.toUpperCase()} · ABOUT</Label>
        <Title>{profile.tagline}</Title>
        <Body className="mt-5">{profile.intro}</Body>
        <div className="mt-6 grid grid-cols-3 gap-3">
          {profile.personality.map((p) => (
            <div key={p.label} className="rounded-2xl bg-white/60 px-3 py-3 text-center">
              <div className="text-2xl">{p.emoji}</div>
              <div className="mt-1 font-display text-sm text-ink">{p.label}</div>
              <div className="mt-0.5 text-xs text-ink-soft">{p.desc}</div>
            </div>
          ))}
        </div>
        <p className="mt-6 font-display italic text-forest">“{profile.philosophy}”</p>
      </>
    );
  }
  if (id === "career") {
    return (
      <>
        <Label>CAREER · 또또가 들려주는 희진의 길</Label>
        <Title>기획부터 운영·실행까지, 혼자서 다 해본 사람</Title>
        {/* 핵심 요약 지표 */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          {careerSummary.metrics.map((m) => (
            <div key={m.label} className="rounded-2xl bg-white/60 px-3 py-3 text-center">
              <div className="font-display text-xl text-forest">{m.value}</div>
              <div className="mt-1 text-xs text-ink-soft">{m.label}</div>
            </div>
          ))}
        </div>
        {/* 간단 타임라인 */}
        <div className="mt-5 space-y-2">
          {careerJourney.map((n) => (
            <div key={n.company} className="flex items-center gap-3">
              <span className="text-xl">{n.emoji}</span>
              <span className="font-display text-ink">{n.company}</span>
              <span className="text-sm text-ink-soft">· {n.role}</span>
            </div>
          ))}
        </div>
      </>
    );
  }
  if (id === "notalk") return <ProjectView p={notalk} accent="#3a9e8f" />;
  if (id === "todaypop") return <ProjectView p={todaypop} accent="#d96a86" />;
  if (id === "business") return <StoryView data={business} accent="#4a6aa0" />;
  if (id === "future") return <StoryView data={future} accent="#b08a2a" />;
  if (id === "ending") {
    return (
      <div className="text-center">
        <Label center>{ending.label}</Label>
        <Title center>{ending.title}</Title>
        <div className="mt-4 space-y-1">
          {ending.lines.map((l, i) => (
            <Body key={i}>{l}</Body>
          ))}
        </div>
        <p className="mt-6 font-display text-lg text-forest">{ending.contact}</p>
      </div>
    );
  }
  return null;
}

function Label({ children, center }: { children: React.ReactNode; center?: boolean }) {
  return (
    <p
      className={`font-display text-xs tracking-[0.32em] text-forest/80 ${center ? "text-center" : ""}`}
    >
      {children}
    </p>
  );
}
function Title({ children, center }: { children: React.ReactNode; center?: boolean }) {
  return (
    <p
      className={`mt-3 font-display text-3xl leading-snug text-ink md:text-4xl ${center ? "text-center" : ""}`}
    >
      {children}
    </p>
  );
}
function Body({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <p className={`leading-relaxed text-ink-soft ${className}`}>{children}</p>;
}

function ProjectView({ p, accent }: { p: Project; accent: string }) {
  return (
    <>
      <p className="font-display text-xs tracking-[0.32em]" style={{ color: accent }}>
        {p.emoji} PROJECT · {p.title}
      </p>
      <Title>{p.tagline}</Title>
      <div className="mt-5 space-y-2 text-sm leading-relaxed text-ink-soft">
        <p><span className="font-display text-ink">문제 </span>{p.problem}</p>
        <p><span className="font-display text-ink">해결 </span>{p.solution}</p>
        <p><span className="font-display text-ink">성과 </span>{p.result}</p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {p.stack.map((s) => (
          <span key={s} className="rounded-full px-3 py-1 text-xs text-ink" style={{ backgroundColor: `${accent}28` }}>
            {s}
          </span>
        ))}
      </div>
    </>
  );
}

function StoryView({
  data,
  accent,
}: {
  data: { emoji: string; label: string; title: string; lines: readonly string[] };
  accent: string;
}) {
  return (
    <>
      <p className="font-display text-xs tracking-[0.32em]" style={{ color: accent }}>
        {data.emoji} {data.label}
      </p>
      <Title>{data.title}</Title>
      <div className="mt-4 space-y-1">
        {data.lines.map((l, i) => (
          <Body key={i}>{l}</Body>
        ))}
      </div>
    </>
  );
}
