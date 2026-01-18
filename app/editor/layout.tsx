import type { Metadata } from "next";
import { PropsWithChildren } from "react";

export const metadata: Metadata = {
  title: "Web Office - Preview & Edit Office Documents",
  description:
    "A local Office file preview and editing application. Open, view, and edit Word, Excel, and PowerPoint documents directly in your browser.",
};

export default function Layout({ children }: PropsWithChildren<{}>) {
  return <>{children}</>;
}
