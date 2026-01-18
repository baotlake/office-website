import {
  FileText,
  FileSpreadsheet,
  Presentation,
  FileType2,
  LucideIcon,
} from "lucide-react";

export interface DocumentTypeConfig {
  type: string;
  label: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  hoverBgColor: string;
  lightBgColor: string;
}

export const DOCUMENT_TYPES: Record<string, DocumentTypeConfig> = {
  docx: {
    type: "docx",
    label: "Document",
    icon: FileText,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    hoverBgColor: "group-hover:bg-blue-600",
    lightBgColor: "bg-blue-100",
  },
  doc: {
    type: "doc",
    label: "Document",
    icon: FileText,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    hoverBgColor: "group-hover:bg-blue-600",
    lightBgColor: "bg-blue-100",
  },
  xlsx: {
    type: "xlsx",
    label: "Spreadsheet",
    icon: FileSpreadsheet,
    color: "text-green-600",
    bgColor: "bg-green-50",
    hoverBgColor: "group-hover:bg-green-600",
    lightBgColor: "bg-green-100",
  },
  xls: {
    type: "xls",
    label: "Spreadsheet",
    icon: FileSpreadsheet,
    color: "text-green-600",
    bgColor: "bg-green-50",
    hoverBgColor: "group-hover:bg-green-600",
    lightBgColor: "bg-green-100",
  },
  pptx: {
    type: "pptx",
    label: "Presentation",
    icon: Presentation,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    hoverBgColor: "group-hover:bg-orange-600",
    lightBgColor: "bg-orange-100",
  },
  ppt: {
    type: "ppt",
    label: "Presentation",
    icon: Presentation,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    hoverBgColor: "group-hover:bg-orange-600",
    lightBgColor: "bg-orange-100",
  },
  pdf: {
    type: "pdf",
    label: "PDF",
    icon: FileType2,
    color: "text-red-600",
    bgColor: "bg-red-50",
    hoverBgColor: "group-hover:bg-red-600",
    lightBgColor: "bg-red-100",
  },
};

export function getDocConfig(type: string): DocumentTypeConfig {
  const normalizedType = type.toLowerCase().replace(".", "");
  return (
    DOCUMENT_TYPES[normalizedType] || {
      type: "unknown",
      label: "File",
      icon: FileText,
      color: "text-primary",
      bgColor: "bg-primary/5",
      hoverBgColor: "group-hover:bg-primary",
      lightBgColor: "bg-primary/10",
    }
  );
}
