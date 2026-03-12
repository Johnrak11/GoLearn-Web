"use client";

import { useState, useEffect } from "react";
import { DollarSign, CheckCircle, Clock } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  withdrawalApi,
  EarningSummary,
  WithdrawalRequest,
} from "@/lib/api/withdrawal";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function WithdrawalsPage() {
  const user = useAuthStore((state) => state.user);
  const isInstructor = user?.roles?.includes("instructor") || false;
  const isAdmin = user?.roles?.includes("admin") || false;

  const [earnings, setEarnings] = useState<EarningSummary | null>(null);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [note, setNote] = useState("");
  const [requestError, setRequestError] = useState("");

  const [selectedReview, setSelectedReview] =
    useState<WithdrawalRequest | null>(null);
  const [reviewStatus, setReviewStatus] = useState<
    "APPROVED" | "REJECTED" | "PAID"
  >("APPROVED");
  const [adminNote, setAdminNote] = useState("");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (isAdmin) {
        const all = await withdrawalApi.getAllWithdrawals();
        setWithdrawals(all);
      } else if (isInstructor) {
        const [earn, my] = await Promise.all([
          withdrawalApi.getMyEarnings(),
          withdrawalApi.getMyWithdrawals(),
        ]);
        setEarnings(earn);
        setWithdrawals(my);
      }
    } catch (error) {
      console.error("Error fetching withdrawal data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleRequestSubmit = async () => {
    try {
      setRequestError("");
      await withdrawalApi.requestWithdrawal({
        bank_name: bankName,
        account_number: accountNumber,
        account_name: accountName,
        note,
      });
      setIsRequestOpen(false);

      // Clear form
      setBankName("");
      setAccountNumber("");
      setAccountName("");
      setNote("");

      fetchData();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } } };
      setRequestError(err.response?.data?.error || "Failed to submit request.");
    }
  };

  const handleReviewSubmit = async () => {
    if (!selectedReview) return;
    try {
      await withdrawalApi.reviewWithdrawal(selectedReview.id, {
        status: reviewStatus,
        admin_note: adminNote,
      });
      setSelectedReview(null);
      setAdminNote("");
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "APPROVED":
        return "bg-blue-100 text-blue-800";
      case "PAID":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) return <div className="p-8">Loading...</div>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Earnings & Payouts
          </h1>
          <p className="text-muted-foreground">
            {isAdmin
              ? "Manage teacher withdrawal requests"
              : "View your earnings and request payouts"}
          </p>
        </div>
        {isInstructor && !isAdmin && earnings && earnings.netAvailable > 0 && (
          <Dialog open={isRequestOpen} onOpenChange={setIsRequestOpen}>
            <DialogTrigger asChild>
              <Button>Request Withdrawal</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Request Withdrawal</DialogTitle>
                <DialogDescription>
                  You have ${Number(earnings.netAvailable || 0).toFixed(2)}{" "}
                  available. Provide your bank details to request a payout.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {requestError && (
                  <div className="text-sm font-medium text-red-500">
                    {requestError}
                  </div>
                )}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="bank" className="text-right">
                    Bank
                  </Label>
                  <Input
                    id="bank"
                    className="col-span-3"
                    placeholder="e.g. ABA Bank"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="accName" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="accName"
                    className="col-span-3"
                    placeholder="Account Holder Name"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="accNum" className="text-right">
                    Number
                  </Label>
                  <Input
                    id="accNum"
                    className="col-span-3"
                    placeholder="Account Number"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="note" className="text-right">
                    Note
                  </Label>
                  <Textarea
                    id="note"
                    className="col-span-3"
                    placeholder="Optional notes for admin"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsRequestOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="button" onClick={handleRequestSubmit}>
                  Submit Request
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isInstructor && earnings && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Gross Earnings
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${Number(earnings.totalGross || 0).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Before {isAdmin ? "system" : "platform"} fees
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Available for Payout
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${Number(earnings.netAvailable || 0).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">Ready to request</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Payout
              </CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                ${Number(earnings.pendingWithdrawal || 0).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently reviewing
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Withdrawn
              </CardTitle>
              <DollarSign className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                ${Number(earnings.netWithdrawn || 0).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Successfully transferred
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Earnings History (Student Payments)</CardTitle>
        </CardHeader>
        <CardContent>
          {!earnings || !earnings.records || earnings.records.length === 0 ? (
            <div className="py-6 text-center text-muted-foreground">
              No earning transactions found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Gross</TableHead>
                  <TableHead>Net</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {earnings.records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      {new Date(record.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {record.enrollment?.user?.full_name ||
                          "Unknown Student"}
                      </div>
                    </TableCell>
                    <TableCell>
                      {record.course?.title || "Unknown Course"}
                    </TableCell>
                    <TableCell className="font-medium">
                      ${Number(record.gross_amount).toFixed(2)}
                    </TableCell>
                    <TableCell className="font-medium text-green-600">
                      ${Number(record.net_amount).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="scrollable"
                        className={
                          record.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-800"
                            : record.status === "WITHDRAWN"
                              ? "bg-green-100 text-green-800"
                              : "bg-blue-100 text-blue-800"
                        }
                      >
                        {record.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Withdrawal History Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {withdrawals.length === 0 ? (
            <div className="py-6 text-center text-muted-foreground">
              No withdrawal requests found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  {isAdmin && <TableHead>Teacher</TableHead>}
                  <TableHead>Amount</TableHead>
                  <TableHead>Bank Info</TableHead>
                  <TableHead>Status</TableHead>
                  {isAdmin && (
                    <TableHead className="text-right">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawals.map((w) => (
                  <TableRow key={w.id}>
                    <TableCell>
                      {new Date(w.requested_at).toLocaleString()}
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        <div className="font-medium">
                          {w.instructor?.full_name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {w.instructor?.email}
                        </div>
                      </TableCell>
                    )}
                    <TableCell className="font-bold">
                      ${Number(w.amount).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{w.bank_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {w.account_number} ({w.account_name})
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={getStatusColor(w.status)}
                        variant="outline"
                      >
                        {w.status}
                      </Badge>
                      {w.admin_note && (
                        <div className="text-xs mt-1 text-gray-500 italic">
                          &quot;{w.admin_note}&quot;
                        </div>
                      )}
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedReview(w);
                            setReviewStatus(
                              w.status === "PENDING"
                                ? "APPROVED"
                                : (w.status as
                                    | "APPROVED"
                                    | "REJECTED"
                                    | "PAID"),
                            );
                          }}
                        >
                          Review
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Admin Review Modal */}
      {isAdmin && (
        <Dialog
          open={!!selectedReview}
          onOpenChange={(open) => !open && setSelectedReview(null)}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Review Withdrawal Request</DialogTitle>
              <DialogDescription>
                Update the status of this withdrawal request.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label>Amount Requested</Label>
                <div className="font-bold text-lg">
                  ${Number(selectedReview?.amount || 0).toFixed(2)}
                </div>
              </div>
              <div>
                <Label>Bank Information</Label>
                <div className="text-sm">
                  {selectedReview?.bank_name} - {selectedReview?.account_number}
                </div>
                <div className="text-sm">{selectedReview?.account_name}</div>
              </div>
              {selectedReview?.note && (
                <div>
                  <Label>Teacher Note</Label>
                  <div className="text-sm text-gray-600 italic">
                    &quot;{selectedReview.note}&quot;
                  </div>
                </div>
              )}
              <div className="grid grid-cols-4 items-center gap-4 mt-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select
                  value={reviewStatus}
                  onValueChange={(val) =>
                    setReviewStatus(val as "APPROVED" | "REJECTED" | "PAID")
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="APPROVED">Approve</SelectItem>
                    <SelectItem value="PAID">Mark as Paid</SelectItem>
                    <SelectItem value="REJECTED">Reject</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="adminNote" className="text-right">
                  Admin Note
                </Label>
                <Textarea
                  id="adminNote"
                  className="col-span-3"
                  placeholder="Visible to the teacher"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedReview(null)}
              >
                Cancel
              </Button>
              <Button type="button" onClick={handleReviewSubmit}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
