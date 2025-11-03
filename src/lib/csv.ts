export interface CSVTender {
  id: string;
  title: string;
  buyerName?: string;
  mainProcurementCategory?: string;
  closingDate?: string;
  status?: string;
  submissionMethods?: string[];
  description?: string;
}

export const exportToCSV = (tenders: CSVTender[], filename: string = "tenders.csv") => {
  const headers = [
    "ID",
    "Title",
    "Buyer",
    "Category",
    "Closing Date",
    "Status",
    "Submission Methods",
    "Description",
  ];

  const rows = tenders.map((t) => [
    t.id,
    t.title,
    t.buyerName || "",
    t.mainProcurementCategory || "",
    t.closingDate || "",
    t.status || "",
    t.submissionMethods?.join("; ") || "",
    (t.description || "").replace(/"/g, '""'),
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
