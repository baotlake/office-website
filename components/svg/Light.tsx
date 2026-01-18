import * as React from "react";
import type { SVGProps } from "react";
const SvgLight = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    preserveAspectRatio="none"
    viewBox="0 0 200 120"
    {...props}
  >
    <path fill="#E2E8F0" d="M0 0h200v120H0z" />
    <path fill="#CBD5E1" d="M0 0h200v12H0z" />
    <rect width={30} height={3} x={85} y={4} fill="#94A3B8" rx={1.5} />
    <path fill="#F1F5F9" d="M0 12h200v24H0z" />
    <rect
      width={184}
      height={16}
      x={8}
      y={16}
      fill="#fff"
      stroke="#CBD5E1"
      strokeWidth={0.5}
      rx={2}
    />
    <rect width={12} height={6} x={14} y={21} fill="#E2E8F0" rx={1} />
    <path fill="#F1F5F9" d="M12 36h188v76H12z" />
    <rect
      width={140}
      height={70}
      x={35}
      y={42}
      fill="#fff"
      stroke="#E2E8F0"
      strokeWidth={0.5}
      rx={1}
    />
    <path
      fill="#F1F5F9"
      stroke="#CBD5E1"
      strokeWidth={0.5}
      d="M0 112h200v8H0z"
    />
  </svg>
);
export default SvgLight;
