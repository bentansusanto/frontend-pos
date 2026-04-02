"use client";

import { useGetPosSessionsQuery } from "@/store/services/pos-session.service";
import { useGetAllUsersQuery } from "@/store/services/user.service";
import { useGetBranchesQuery } from "@/store/services/branch.service";
import { SessionDetailModal } from "@/components/modules/POS/SessionDetailModal";
import { format } from "date-fns";
import { Copy, Eye, Loader2 } from "lucide-react";
import React from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { formatUSD } from "@/utils/format-rupiah";

import { useGetProfileQuery } from "@/store/services/auth.service";
import { useRouter } from "next/navigation";

export default function PosLogPage() {
  const router = useRouter();
  const { data: user, isLoading: isLoadingProfile } = useGetProfileQuery();
  const { data: posSessions, isLoading } = useGetPosSessionsQuery();
  const { data: usersData } = useGetAllUsersQuery();
  const { data: branchesData } = useGetBranchesQuery();

  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedSessionId, setSelectedSessionId] = React.useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = React.useState(false);

  const selectedSessionInfo = React.useMemo(() => {
    if (!selectedSessionId || !posSessions) return null;
    const session = posSessions.find((s: any) => s.id === selectedSessionId);
    if (!session) return null;

    // Use the enriched logic or just manual lookup
    const user = session.user?.id ? usersData?.find((u: any) => u.id === session.user.id) : null;
    const branch = session.branch?.id ? branchesData?.find((b: any) => b.id === session.branch.id) : null;

    return {
      id: session.id,
      userName: user?.name || "Unknown",
      branchName: branch?.name || "Unknown"
    };
  }, [selectedSessionId, posSessions, usersData, branchesData]);

  const usersMap = React.useMemo(() => {
    const map = new Map();
    if (Array.isArray(usersData)) {
      usersData.forEach((u: any) => map.set(u.id, u));
    }
    return map;
  }, [usersData]);

  const branchesMap = React.useMemo(() => {
    const map = new Map();
    if (Array.isArray(branchesData)) {
      branchesData.forEach((b: any) => map.set(b.id, b));
    }
    return map;
  }, [branchesData]);

  const filteredSessions = React.useMemo(() => {
    if (!posSessions) return [];

    // Enrich sessions with names for filtering and display
    const enriched = posSessions.map((session: any) => {
      const user = session.user?.id ? usersMap.get(session.user.id) : null;
      const branch = session.branch?.id ? branchesMap.get(session.branch.id) : null;
      return {
        ...session,
        _userName: user?.name || "Unknown",
        _branchName: branch?.name || "Unknown"
      };
    });

    const lowerSearch = searchTerm.toLowerCase();
    const result = searchTerm ? enriched.filter(
      (session: any) =>
        session._userName.toLowerCase().includes(lowerSearch) ||
        session._branchName.toLowerCase().includes(lowerSearch) ||
        session.id.toLowerCase().includes(lowerSearch) ||
        session.notes?.toLowerCase().includes(lowerSearch)
    ) : enriched;

    return result.sort((a: any, b: any) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  }, [posSessions, searchTerm, usersMap, branchesMap]);

  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 10;
  const totalItems = filteredSessions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentData = filteredSessions.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("ID coped to clipboard");
  };

  React.useEffect(() => {
    if (user && user.role === "cashier") {
      router.push("/dashboard");
      toast.error("You are not authorized to view this page.");
    }
  }, [user, router]);

  if (isLoadingProfile) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-4">
        <Loader2 className="text-primary h-10 w-10 animate-spin" />
        <p className="text-muted-foreground animate-pulse">Checking permissions...</p>
      </div>
    );
  }

  if (user?.role === "cashier") {
    return null;
  }

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">POS Log</h2>
          <p className="text-muted-foreground">
            Monitoring cashier sessions and cash drawer balances.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Session History</CardTitle>
              <CardDescription>
                History of all open and closed POS sessions across branches.
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Search staff, branch, or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-[250px]"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-[300px] items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="text-primary h-8 w-8 animate-spin" />
                <p className="text-muted-foreground text-sm">Loading sessions...</p>
              </div>
            </div>
          ) : !filteredSessions?.length ? (
            <div className="flex h-[300px] items-center justify-center">
              <p className="text-muted-foreground text-sm">No POS sessions found.</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Staff</TableHead>
                      <TableHead>Branch</TableHead>
                      <TableHead>Opened At</TableHead>
                      <TableHead>Closed At</TableHead>
                      <TableHead className="text-right">Opening Bal.</TableHead>
                      <TableHead className="text-right">Closing Bal.</TableHead>
                      <TableHead className="text-center w-20">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentData.map((session: any) => {
                      const isOpen = session.status === "OPEN";
                      return (
                        <TableRow key={session.id}>
                          <TableCell>
                            <Badge
                              variant={isOpen ? "default" : "secondary"}
                              className={cn(
                                "w-20 justify-center",
                                isOpen
                                  ? "bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-400"
                                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400"
                              )}>
                              {session.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium text-sm">{session._userName}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{session._branchName}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(session.startTime), "dd MMM yy, HH:mm")}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {session.endTime
                                ? format(new Date(session.endTime), "dd MMM yy, HH:mm")
                                : "-"}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatUSD(session.openingBalance)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {session.closingBalance !== null && session.closingBalance !== undefined
                              ? formatUSD(session.closingBalance)
                              : "-"}
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-primary hover:text-primary/80 hover:bg-primary/10"
                              onClick={() => {
                                setSelectedSessionId(session.id);
                                setIsDetailModalOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              <div className="flex flex-col items-center justify-center gap-4 px-2 py-6 border-t">
                <p className="text-xs text-muted-foreground text-center">
                  Showing <span className="font-medium">{totalItems > 0 ? startIndex + 1 : 0}–{endIndex}</span> of{" "}
                  <span className="font-medium">{totalItems}</span> sessions
                </p>
                <Pagination className="mx-0 w-auto">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(currentPage - 1);
                        }}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                      .map((page, index, arr) => {
                        const showEllipsis = arr[index - 1] && page - arr[index - 1] > 1;
                        return (
                          <React.Fragment key={page}>
                            {showEllipsis && (
                              <PaginationItem>
                                <PaginationEllipsis />
                              </PaginationItem>
                            )}
                            <PaginationItem>
                              <PaginationLink
                                href="#"
                                isActive={currentPage === page}
                                onClick={(e) => {
                                  e.preventDefault();
                                  handlePageChange(page);
                                }}
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          </React.Fragment>
                        );
                      })}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(currentPage + 1);
                        }}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <SessionDetailModal
        isOpen={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        sessionId={selectedSessionId}
        userName={selectedSessionInfo?.userName || ""}
        branchName={selectedSessionInfo?.branchName || ""}
      />
    </div>
  );
}
