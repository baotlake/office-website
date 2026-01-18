import * as React from "react";
import type { SVGProps } from "react";
const SvgModernDark = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    preserveAspectRatio="none"
    viewBox="0 0 200 120"
    {...props}
  >
    <path fill="#1C1C1C" d="M0 0h200v120H0z" />
    <path fill="#252525" d="M0 0h200v12H0z" />
    <rect width={30} height={3} x={85} y={4} fill="#555" rx={1.5} />
    <circle cx={190} cy={6} r={3} fill="#4A4A4A" />
    <path fill="#333" d="M0 12h200v24H0z" />
    <rect
      width={184}
      height={16}
      x={8}
      y={16}
      fill="#3D3D3D"
      stroke="#4A4A4A"
      strokeWidth={0.5}
      rx={4}
    />
    <rect width={12} height={6} x={14} y={21} fill="#666" rx={1} />
    <rect width={20} height={6} x={30} y={21} fill="#666" rx={1} />
    <rect width={20} height={8} x={140} y={20} fill="#fff" rx={1} />
    <rect width={20} height={8} x={165} y={20} fill="#4A4A4A" rx={1} />
    <path fill="#252525" d="M0 36h12v76H0z" />
    <rect width={6} height={6} x={3} y={42} fill="#777" rx={1.5} />
    <rect width={6} height={6} x={3} y={52} fill="#777" rx={1.5} />
    <path fill="#333" stroke="#4A4A4A" strokeWidth={0.5} d="M12 36h188v6H12z" />
    <path fill="#1C1C1C" d="M12 42h188v70H12z" />
    <rect width={140} height={64} x={35} y={48} fill="#fff" rx={1} />
    <rect width={60} height={2} x={45} y={58} fill="#F0F0F0" rx={1} />
    <rect width={100} height={2} x={45} y={64} fill="#F0F0F0" rx={1} />
    <path
      fill="#2D2D2D"
      stroke="#4A4A4A"
      strokeWidth={0.5}
      d="M0 112h200v8H0z"
    />
  </svg>
);
export default SvgModernDark;
