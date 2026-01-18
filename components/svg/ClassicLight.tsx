import * as React from "react";
import type { SVGProps } from "react";
const SvgClassicLight = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    preserveAspectRatio="none"
    viewBox="0 0 200 120"
    {...props}
  >
    <path fill="#E8EBEE" d="M0 0h200v120H0z" />
    <path fill="#446995" d="M0 0h200v15H0z" />
    <rect
      width={30}
      height={3}
      x={85}
      y={6}
      fill="#fff"
      fillOpacity={0.8}
      rx={1.5}
    />
    <path fill="#F3F3F3" d="M12 15h25v12H12z" />
    <path fill="transparent" d="M42 15h25v12H42z" />
    <path
      fill="#F3F3F3"
      stroke="#D1D1D1"
      strokeWidth={0.5}
      d="M0 27h200v20H0z"
    />
    <rect width={40} height={4} x={10} y={32} fill="#D1D1D1" rx={1} />
    <rect width={60} height={4} x={10} y={39} fill="#E5E5E5" rx={1} />
    <rect
      width={50}
      height={10}
      x={140}
      y={32}
      fill="#fff"
      stroke="#D1D1D1"
      strokeWidth={0.5}
      rx={1}
    />
    <path fill="#E8EBEE" d="M0 47h12v65H0z" />
    <rect width={6} height={6} x={3} y={52} fill="#99ABB9" rx={1} />
    <path fill="#D6DBE2" d="M12 47h188v65H12z" />
    <rect width={140} height={68} x={35} y={52} fill="#fff" rx={1} />
    <path
      fill="#F3F3F3"
      stroke="#D1D1D1"
      strokeWidth={0.5}
      d="M0 112h200v8H0z"
    />
  </svg>
);
export default SvgClassicLight;
