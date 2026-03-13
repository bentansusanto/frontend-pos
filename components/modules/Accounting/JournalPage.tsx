"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { BookOpen, Plus, Search } from "lucide-react";
import { useState } from "react";
import { formatRupiah } from "@/utils/format-rupiah";
import { useJournalEntries } from "./hooks";
import { format } from "date-fns";

export function JournalPage() {
  const { entries, isLoading } = useJournalEntries();
  const [search, setSearch] = useState("");
  const [month, setMonth] = useState("all");

  // Flatten journal entries into display rows based on journalLines
  const flattenedEntries: any[] = [];
  entries.forEach((entry: any) => {
    // Determine main accounts simply for overview (assuming max debit/credit if multiple)
    const debitLine = [...(entry.journalLines || [])].sort((a, b) => b.debit - a.debit)[0] || {};
    const creditLine = [...(entry.journalLines || [])].sort((a, b) => b.credit - a.credit)[0] || {};
    
    // Sum total debit/credit for the whole entry
    const totalDebit = entry.journalLines?.reduce((sum: number, l: any) => sum + Number(l.debit || 0), 0) || 0;
    const totalCredit = entry.journalLines?.reduce((sum: number, l: any) => sum + Number(l.credit || 0), 0) || 0;

    flattenedEntries.push({
      id: entry.id,
      date: entry.date ? format(new Date(entry.date), "yyyy-MM-dd") : "-",
      description: entry.description || "-",
      debitAccount: debitLine?.account?.name || "Multiple/None",
      creditAccount: creditLine?.account?.name || "Multiple/None",
      debit: totalDebit,
      credit: totalCredit,
      reference: entry.referenceCode || "-"
    });
  });

  const filtered = flattenedEntries.filter((j) => {
    const matchSearch =
      j.description.toLowerCase().includes(search.toLowerCase()) ||
      j.id.toLowerCase().includes(search.toLowerCase()) ||
      j.reference.toLowerCase().includes(search.toLowerCase());
    
    let matchMonth = true;
    if (month !== "all") {
      matchMonth = j.date.split("-")[1] === month;
    }
    
    return matchSearch && matchMonth;
  });

  const totalDebit = filtered.reduce((sum, j) => sum + j.debit, 0);
  const totalCredit = filtered.reduce((sum, j) => sum + j.credit, 0);

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
            <BookOpen className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">General Journal</h1>
            <p className="text-muted-foreground text-sm">Double-entry accounting records</p>
          </div>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Entry
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Entries", value: filtered.length.toString(), color: "text-blue-600" },
          { label: "Total Debit", value: formatRupiah(totalDebit), color: "text-green-600" },
          { label: "Total Credit", value: formatRupiah(totalCredit), color: "text-orange-600" }
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-xl border p-4 text-center">
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-muted-foreground mt-1 text-xs">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border">
        <div className="flex items-center gap-3 border-b p-4">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              className="pl-9"
              placeholder="Search journal entries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Months</SelectItem>
              <SelectItem value="01">January</SelectItem>
              <SelectItem value="02">February</SelectItem>
              <SelectItem value="03">March</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant="secondary">{filtered.length} entries</Badge>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Entry ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Debit Account</TableHead>
              <TableHead>Credit Account</TableHead>
              <TableHead className="text-right">Debit</TableHead>
              <TableHead className="text-right">Credit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-muted-foreground py-12 text-center">
                  Loading journal entries...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-muted-foreground py-12 text-center">
                  <BookOpen className="mx-auto mb-3 h-8 w-8 opacity-30" />
                  No journal entries found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((entry) => (
                <TableRow key={entry.id} className="group">
                  <TableCell>
                    <Badge variant="outline" className="text-xs uppercase">
                      {entry.id.substring(0, 8)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{entry.date}</TableCell>
                  <TableCell>
                    <p className="font-medium">{entry.description}</p>
                    <p className="text-muted-foreground text-xs">{entry.reference}</p>
                  </TableCell>
                  <TableCell className="text-sm">{entry.debitAccount}</TableCell>
                  <TableCell className="text-sm">{entry.creditAccount}</TableCell>
                  <TableCell className="text-right font-semibold text-green-600">
                    {formatRupiah(entry.debit)}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-orange-600">
                    {formatRupiah(entry.credit)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
