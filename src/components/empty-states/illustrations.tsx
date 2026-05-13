"use client";

import { motion } from "framer-motion";

/**
 * Custom SVG illustrations themed to the beauty/spa rubro.
 * Each is 160Ã—160 viewBox with the lila/peach palette.
 * Subtle sparkles animated to give "alive" feeling.
 */

const sparkleTransition = {
  duration: 2.2,
  repeat: Infinity,
  ease: "easeInOut" as const,
};

function Sparkle({
  cx,
  cy,
  size = 5,
  delay = 0,
  color = "#5C435D",
}: {
  cx: number;
  cy: number;
  size?: number;
  delay?: number;
  color?: string;
}) {
  return (
    <motion.g
      animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
      transition={{ ...sparkleTransition, delay }}
    >
      <path
        d={`M ${cx} ${cy - size} L ${cx + size * 0.4} ${cy - size * 0.4} L ${cx + size} ${cy} L ${cx + size * 0.4} ${cy + size * 0.4} L ${cx} ${cy + size} L ${cx - size * 0.4} ${cy + size * 0.4} L ${cx - size} ${cy} L ${cx - size * 0.4} ${cy - size * 0.4} Z`}
        fill={color}
      />
    </motion.g>
  );
}

export function IllustrationAgenda() {
  return (
    <svg
      width="160"
      height="160"
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-soft"
    >
      <defs>
        <linearGradient id="g-nail" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E9B7B8" />
          <stop offset="100%" stopColor="#E9B7B8" />
        </linearGradient>
        <linearGradient id="g-nail2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#D8C7D9" />
          <stop offset="100%" stopColor="#5C435D" />
        </linearGradient>
      </defs>
      <circle cx="80" cy="80" r="68" fill="#FFF3EA" opacity="0.4" />
      <ellipse cx="62" cy="88" rx="14" ry="22" fill="url(#g-nail)" />
      <ellipse cx="62" cy="80" rx="10" ry="6" fill="#FFFCFB" opacity="0.7" />
      <ellipse cx="98" cy="92" rx="14" ry="22" fill="url(#g-nail2)" />
      <ellipse cx="98" cy="84" rx="10" ry="6" fill="#FFFCFB" opacity="0.6" />
      <Sparkle cx={40} cy={50} size={5} delay={0} color="#5C435D" />
      <Sparkle cx={120} cy={42} size={6} delay={0.5} color="#E9B7B8" />
      <Sparkle cx={130} cy={120} size={4} delay={1} color="#D8C7D9" />
      <Sparkle cx={30} cy={120} size={5} delay={1.5} color="#5C435D" />
    </svg>
  );
}

export function IllustrationCustomers() {
  return (
    <svg
      width="160"
      height="160"
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-soft"
    >
      <defs>
        <linearGradient id="g-hair" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1F1A2E" />
          <stop offset="100%" stopColor="#3A2E50" />
        </linearGradient>
      </defs>
      <circle cx="80" cy="80" r="68" fill="#E9B7B8" opacity="0.35" />
      <path
        d="M 50 95 Q 50 60 80 60 Q 110 60 110 95 L 110 110 L 50 110 Z"
        fill="url(#g-hair)"
      />
      <circle cx="80" cy="80" r="22" fill="#FFF3EA" />
      <circle cx="73" cy="78" r="2" fill="#1F1A2E" />
      <circle cx="87" cy="78" r="2" fill="#1F1A2E" />
      <path
        d="M 73 88 Q 80 92 87 88"
        stroke="#E0556F"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="55" cy="80" r="4" fill="#E9B7B8" />
      <circle cx="55" cy="75" r="3" fill="#E9B7B8" opacity="0.7" />
      <circle cx="58" cy="83" r="3" fill="#E9B7B8" opacity="0.7" />
      <circle cx="105" cy="80" r="4" fill="#E9B7B8" />
      <circle cx="105" cy="75" r="3" fill="#E9B7B8" opacity="0.7" />
      <circle cx="102" cy="83" r="3" fill="#E9B7B8" opacity="0.7" />
      <Sparkle cx={30} cy={50} size={5} delay={0.2} />
      <Sparkle cx={130} cy={50} size={5} delay={0.8} />
      <Sparkle cx={140} cy={130} size={4} delay={1.3} color="#E9B7B8" />
    </svg>
  );
}

export function IllustrationServices() {
  return (
    <svg
      width="160"
      height="160"
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-soft"
    >
      <defs>
        <linearGradient id="g-bottle" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D8C7D9" />
          <stop offset="100%" stopColor="#5C435D" />
        </linearGradient>
        <linearGradient id="g-brush" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1F1A2E" />
          <stop offset="100%" stopColor="#3A2E50" />
        </linearGradient>
      </defs>
      <circle cx="80" cy="80" r="68" fill="#D8C7D9" opacity="0.3" />
      <rect x="55" y="60" width="34" height="62" rx="6" fill="url(#g-bottle)" />
      <rect x="62" y="48" width="20" height="14" rx="3" fill="#1F1A2E" />
      <rect x="64" y="51" width="16" height="8" rx="1" fill="#5C435D" />
      <rect
        x="61"
        y="80"
        width="22"
        height="34"
        rx="2"
        fill="#FFFCFB"
        opacity="0.6"
      />
      <rect x="100" y="42" width="6" height="60" rx="3" fill="url(#g-brush)" />
      <path
        d="M 95 102 Q 95 115 103 115 Q 111 115 111 102 L 111 95 L 95 95 Z"
        fill="#E9B7B8"
      />
      <Sparkle cx={40} cy={40} size={5} delay={0} />
      <Sparkle cx={130} cy={130} size={6} delay={0.6} color="#E9B7B8" />
      <Sparkle cx={130} cy={60} size={4} delay={1.2} color="#D8C7D9" />
    </svg>
  );
}

export function IllustrationCash() {
  return (
    <svg
      width="160"
      height="160"
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-soft"
    >
      <defs>
        <linearGradient id="g-wallet" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E9B7B8" />
          <stop offset="100%" stopColor="#5C435D" />
        </linearGradient>
      </defs>
      <circle cx="80" cy="80" r="68" fill="#FFF3EA" opacity="0.4" />
      <rect
        x="40"
        y="65"
        width="80"
        height="48"
        rx="10"
        fill="url(#g-wallet)"
      />
      <rect x="40" y="60" width="80" height="14" rx="6" fill="#D8C7D9" />
      <circle cx="100" cy="89" r="6" fill="#FFFCFB" />
      <circle cx="100" cy="89" r="3" fill="#5C435D" />
      <rect
        x="50"
        y="48"
        width="22"
        height="14"
        rx="3"
        fill="#6F8F82"
        transform="rotate(-12 61 55)"
      />
      <text
        x="51"
        y="57"
        fill="#FFFCFB"
        fontSize="7"
        fontWeight="700"
        transform="rotate(-12 61 55)"
      >
        S/
      </text>
      <Sparkle cx={32} cy={42} size={5} delay={0.3} />
      <Sparkle cx={128} cy={36} size={5} delay={0.9} color="#E9B7B8" />
      <Sparkle cx={140} cy={120} size={4} delay={1.5} color="#D8C7D9" />
    </svg>
  );
}

export function IllustrationBookings() {
  return (
    <svg
      width="160"
      height="160"
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-soft"
    >
      <defs>
        <linearGradient id="g-bell" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E9B7B8" />
          <stop offset="100%" stopColor="#E9B7B8" />
        </linearGradient>
      </defs>
      <circle cx="80" cy="80" r="68" fill="#D8C7D9" opacity="0.3" />
      <path
        d="M 60 95 Q 60 60 80 55 Q 100 60 100 95 L 105 100 L 55 100 Z"
        fill="url(#g-bell)"
      />
      <circle cx="80" cy="50" r="6" fill="#5C435D" />
      <path d="M 75 105 Q 80 112 85 105 Z" fill="#5C435D" />
      <circle cx="100" cy="60" r="8" fill="#E0556F" />
      <text
        x="100"
        y="64"
        fill="#FFFCFB"
        fontSize="11"
        fontWeight="700"
        textAnchor="middle"
      >
        !
      </text>
      <Sparkle cx={35} cy={50} size={5} delay={0.4} />
      <Sparkle cx={125} cy={110} size={6} delay={1} color="#E9B7B8" />
      <Sparkle cx={45} cy={120} size={4} delay={1.6} color="#D8C7D9" />
    </svg>
  );
}

export function IllustrationGeneric() {
  return (
    <svg
      width="160"
      height="160"
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-soft"
    >
      <defs>
        <linearGradient id="g-generic" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#D8C7D9" />
          <stop offset="50%" stopColor="#E9B7B8" />
          <stop offset="100%" stopColor="#FFF3EA" />
        </linearGradient>
      </defs>
      <circle cx="80" cy="80" r="68" fill="url(#g-generic)" opacity="0.5" />
      <Sparkle cx={80} cy={80} size={20} delay={0} color="#5C435D" />
      <Sparkle cx={40} cy={50} size={6} delay={0.6} />
      <Sparkle cx={120} cy={120} size={6} delay={1.2} color="#E9B7B8" />
    </svg>
  );
}
