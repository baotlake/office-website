import * as React from "react";
import type { SVGProps } from "react";
const SvgContrastDark = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    preserveAspectRatio="none"
    viewBox="0 0 200 120"
    {...props}
  >
    <path fill="#000" d="M0 0h200v120H0z" />
    <path fill="#000" stroke="#FFF" strokeWidth={0.5} d="M0 0h200v12H0z" />
    <rect width={30} height={3} x={85} y={4} fill="#FFF" rx={1.5} />
    <path fill="#000" stroke="#FFF" strokeWidth={0.5} d="M0 12h200v24H0z" />
    <rect
      width={184}
      height={16}
      x={8}
      y={16}
      fill="#000"
      stroke="#FFF"
      rx={2}
    />
    <path fill="#000" stroke="#FFF" strokeWidth={0.5} d="M0 36h12v76H0z" />
    <path fill="#000" d="M12 36h188v76H12z" />
    <rect width={140} height={70} x={35} y={42} fill="#fff" rx={1} />
    <path fill="#000" stroke="#FFF" strokeWidth={0.5} d="M0 112h200v8H0z" />
  </svg>
);
export default SvgContrastDark;
