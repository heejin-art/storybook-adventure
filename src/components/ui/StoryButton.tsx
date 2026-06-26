"use client";

import { motion } from "framer-motion";

/**
 * 동화 무드의 둥근 버튼. "모험 시작하기" / "Contact" 등에 사용.
 */
export function StoryButton({
  children,
  onClick,
  href,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
}) {
  const className =
    "inline-flex items-center gap-2 rounded-full bg-forest px-8 py-3.5 font-display text-lg text-cream shadow-[0_10px_24px_-10px_rgba(111,168,106,0.9)] transition-colors hover:bg-[#5f9459]";

  const content = (
    <motion.span
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.97 }}
      className={className}
    >
      {children}
    </motion.span>
  );

  if (href) {
    return (
      <a href={href} className="inline-block">
        {content}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className="inline-block">
      {content}
    </button>
  );
}
