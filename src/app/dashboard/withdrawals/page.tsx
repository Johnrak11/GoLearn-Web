"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  DollarSign,
  CheckCircle,
  Clock,
  QrCode,
  ArrowRight,
  Info,
  Banknote,
  Navigation,
} from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  withdrawalApi,
  EarningSummary,
  WithdrawalRequest,
} from "@/lib/api/withdrawal";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

export default function WithdrawalsPage() {
  const user = useAuthStore((state) => state.user);
  const isInstructor = user?.roles?.includes("instructor") || false;
  const isAdmin = user?.roles?.includes("admin") || false;

  const [earnings, setEarnings] = useState<EarningSummary | null>(null);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // KHQR Config states
  const [khqrConfig, setKhqrConfig] = useState<{
    bakong_account_id: string;
    merchant_name: string;
  } | null>(null);
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  // Modal states
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [withdrawalMethod, setWithdrawalMethod] = useState<"MANUAL" | "KHQR">(
    "MANUAL",
  );
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [note, setNote] = useState("");
  const [requestError, setRequestError] = useState("");

  // Admin Review states
  const [selectedReview, setSelectedReview] =
    useState<WithdrawalRequest | null>(null);
  const [reviewStatus, setReviewStatus] = useState<
    "APPROVED" | "REJECTED" | "PAID"
  >("APPROVED");
  const [adminNote, setAdminNote] = useState("");
  const [generatedKHQR, setGeneratedKHQR] = useState<{
    qr_string: string;
    md5: string;
  } | null>(null);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (isAdmin) {
        const all = await withdrawalApi.getAllWithdrawals();
        setWithdrawals(all);
      } else if (isInstructor) {
        const [earn, my, config] = await Promise.all([
          withdrawalApi.getMyEarnings(),
          withdrawalApi.getMyWithdrawals(),
          withdrawalApi.getKHQRConfig(),
        ]);
        setEarnings(earn);
        setWithdrawals(my);
        if (config) {
          setKhqrConfig({
            bakong_account_id: config.bakong_account_id,
            merchant_name: config.merchant_name,
          });
          setWithdrawalMethod("KHQR");
        }
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
        method: withdrawalMethod,
        bank_name: withdrawalMethod === "MANUAL" ? bankName : undefined,
        account_number:
          withdrawalMethod === "MANUAL" ? accountNumber : undefined,
        account_name: withdrawalMethod === "MANUAL" ? accountName : undefined,
        note,
      });
      setIsRequestOpen(false);
      toast.success("Withdrawal request submitted successfully!");

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

  const handleSaveKHQRConfig = async () => {
    if (!khqrConfig?.bakong_account_id || !khqrConfig?.merchant_name) {
      toast.error("Please fill in all KHQR fields");
      return;
    }

    setIsSavingConfig(true);
    try {
      await withdrawalApi.saveKHQRConfig(khqrConfig);
      toast.success("KHQR configuration saved!");
    } catch (error) {
      toast.error("Failed to save KHQR configuration");
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleGenerateKHQR = async () => {
    if (!selectedReview) return;
    setIsGeneratingQR(true);
    try {
      const result = await withdrawalApi.generateWithdrawalKHQR(
        selectedReview.id,
      );
      setGeneratedKHQR(result);
    } catch (error) {
      toast.error("Failed to generate teacher KHQR");
    } finally {
      setIsGeneratingQR(false);
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
      setGeneratedKHQR(null);
      toast.success("Withdrawal request updated!");
      fetchData();
    } catch (e) {
      console.error(e);
      toast.error("Failed to update status");
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
                  available.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {requestError && (
                  <div className="text-sm font-medium text-red-500">
                    {requestError}
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select
                    value={withdrawalMethod}
                    onValueChange={(val) =>
                      setWithdrawalMethod(val as "MANUAL" | "KHQR")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KHQR">Bakong KHQR</SelectItem>
                      <SelectItem value="MANUAL">
                        Manual Bank Transfer
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {withdrawalMethod === "KHQR" ? (
                  <div className="p-3 bg-slate-50 rounded-lg border border-indigo-100">
                    {khqrConfig ? (
                      <div className="text-sm space-y-1">
                        <p className="font-semibold text-indigo-700">
                          Ready for KHQR Withdrawal
                        </p>
                        <p className="text-slate-600">
                          ID: {khqrConfig.bakong_account_id}
                        </p>
                        <p className="text-slate-600">
                          Merchant: {khqrConfig.merchant_name}
                        </p>
                      </div>
                    ) : (
                      <div className="text-sm text-amber-600">
                        Please configure your KHQR in the settings tab first.
                      </div>
                    )}
                  </div>
                ) : (
                  <>
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
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="note">Note (Optional)</Label>
                  <Textarea
                    id="note"
                    placeholder="Message for admin"
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
                <Button
                  type="button"
                  onClick={handleRequestSubmit}
                  disabled={withdrawalMethod === "KHQR" && !khqrConfig}
                >
                  Submit Request
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList
          className={isAdmin ? "hidden" : "grid w-full grid-cols-2 mb-4"}
        >
          <TabsTrigger value="overview">Withdrawals</TabsTrigger>
          <TabsTrigger value="settings">Payout Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
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
                    Before platform fees
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
                  <p className="text-xs text-muted-foreground">
                    Ready to request
                  </p>
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
              {!earnings ||
              !earnings.records ||
              earnings.records.length === 0 ? (
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
                      <TableHead>Method</TableHead>
                      <TableHead>Details</TableHead>
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
                          <Badge variant="outline">
                            {w.method || "MANUAL"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {w.method === "KHQR" ? (
                            <div className="text-xs text-muted-foreground italic">
                              Requested via KHQR
                            </div>
                          ) : (
                            <>
                              <div className="text-sm">{w.bank_name}</div>
                              <div className="text-xs text-muted-foreground">
                                {w.account_number} ({w.account_name})
                              </div>
                            </>
                          )}
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
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Bakong KHQR Configuration</CardTitle>
              <CardDescription>
                Configure your Bakong details to receive instant payouts via
                KHQR.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="bakongId">Bakong Account ID</Label>
                <Input
                  id="bakongId"
                  placeholder="e.g. yourname@acleda"
                  value={khqrConfig?.bakong_account_id || ""}
                  onChange={(e) =>
                    setKhqrConfig((prev) => ({
                      bakong_account_id: e.target.value,
                      merchant_name: prev?.merchant_name || "",
                    }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  The Bakong ID where you want to receive your earnings.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="merchantName">Merchant Name (Your Name)</Label>
                <Input
                  id="merchantName"
                  placeholder="e.g. SOK DHARA"
                  value={khqrConfig?.merchant_name || ""}
                  onChange={(e) =>
                    setKhqrConfig((prev) => ({
                      merchant_name: e.target.value,
                      bakong_account_id: prev?.bakong_account_id || "",
                    }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Your full name as it appears in your Bakong account.
                </p>
              </div>

              <Button onClick={handleSaveKHQRConfig} disabled={isSavingConfig}>
                {isSavingConfig ? "Saving..." : "Save KHQR Config"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Admin Review Modal */}
      {isAdmin && (
        <Dialog
          open={!!selectedReview}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedReview(null);
              setGeneratedKHQR(null);
            }
          }}
        >
          <DialogContent className="sm:max-w-[480px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
            <DialogHeader className="p-6 pb-2">
              <DialogTitle>Review Withdrawal Request</DialogTitle>
              <DialogDescription>
                Update the status. If requested via KHQR, you can generate a QR
                code for payment.
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto px-6 py-2 space-y-4">
              <div className="flex justify-between items-start bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                <div>
                  <Label className="text-indigo-600 text-xs font-semibold uppercase tracking-wider">
                    Amount Requested
                  </Label>
                  <div className="font-bold text-3xl text-slate-900 mt-1">
                    ${Number(selectedReview?.amount || 0).toFixed(2)}
                  </div>
                </div>
                <Badge className="bg-indigo-600 hover:bg-indigo-700">
                  {selectedReview?.method}
                </Badge>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                <Label className="text-[10px] uppercase font-bold text-slate-400 mb-3 block tracking-widest">
                  {selectedReview?.method === "KHQR"
                    ? "BAKONG PAYMENT DETAILS"
                    : "BANK TRANSFER DETAILS"}
                </Label>
                {selectedReview?.method === "KHQR" ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <Label className="text-[10px] text-slate-400 block mb-0.5">
                          Account ID
                        </Label>
                        <p className="font-medium text-slate-700 truncate">
                          {selectedReview.khqr_config?.bakong_account_id}
                        </p>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <Label className="text-[10px] text-slate-400 block mb-0.5">
                          Merchant Name
                        </Label>
                        <p className="font-medium text-slate-700 truncate">
                          {selectedReview.khqr_config?.merchant_name}
                        </p>
                      </div>
                    </div>

                    {!generatedKHQR ? (
                      <Button
                        size="lg"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all active:scale-[0.98]"
                        onClick={handleGenerateKHQR}
                        disabled={isGeneratingQR}
                      >
                        {isGeneratingQR ? (
                          <div className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Generating...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <QrCode className="w-4 h-4" />
                            Generate Payment KHQR
                          </div>
                        )}
                      </Button>
                    ) : (
                      <div className="bg-slate-50 p-4 rounded-2xl flex flex-col items-center gap-4 animate-in zoom-in-95 fade-in duration-300">
                        <div className="relative p-3 bg-white rounded-2xl shadow-xl shadow-slate-200 border border-slate-100">
                          <QRCodeSVG
                            value={generatedKHQR.qr_string}
                            size={180}
                            level="H"
                            includeMargin={false}
                            imageSettings={{
                              src: "/favicon.ico",
                              x: undefined,
                              y: undefined,
                              height: 35,
                              width: 35,
                              excavate: true,
                            }}
                          />
                        </div>
                        <div className="text-center space-y-1">
                          <p className="font-bold text-slate-800 text-sm">
                            Scan to Pay Instructor
                          </p>
                          <p className="text-[10px] text-slate-500 max-w-[200px] leading-relaxed">
                            Use any Bakong-enabled app to scan this KHQR and
                            transfer funds.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <Label className="text-[10px] text-slate-400 block mb-0.5 uppercase">
                        Bank Name
                      </Label>
                      <p className="font-semibold text-slate-800 text-base">
                        {selectedReview?.bank_name}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <Label className="text-[10px] text-slate-400 block mb-0.5 uppercase">
                          Account Number
                        </Label>
                        <p className="font-bold text-slate-900">
                          {selectedReview?.account_number}
                        </p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <Label className="text-[10px] text-slate-400 block mb-0.5 uppercase">
                          Account Name
                        </Label>
                        <p className="font-bold text-slate-900 uppercase">
                          {selectedReview?.account_name}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {selectedReview?.note && (
                <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100">
                  <Label className="text-[10px] uppercase font-bold text-amber-600 mb-2 block tracking-widest">
                    TEACHER MESSAGE
                  </Label>
                  <p className="text-sm text-slate-700 italic leading-relaxed font-medium">
                    &quot;{selectedReview.note}&quot;
                  </p>
                </div>
              )}

              <Separator className="bg-slate-200" />

              <div className="space-y-4 pt-1 pb-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-600 flex items-center gap-1.5 uppercase tracking-wide">
                    <Navigation className="w-3 h-3 text-indigo-500" />
                    Update Status
                  </Label>
                  <Select
                    value={reviewStatus}
                    onValueChange={(val) =>
                      setReviewStatus(val as "APPROVED" | "REJECTED" | "PAID")
                    }
                  >
                    <SelectTrigger className="bg-white border-slate-200 h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="APPROVED">Review & Approve</SelectItem>
                      <SelectItem value="PAID">Mark as Paid (Final)</SelectItem>
                      <SelectItem value="REJECTED">Reject Request</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-600 flex items-center gap-1.5 uppercase tracking-wide">
                    <Info className="w-3 h-3 text-indigo-500" />
                    Admin Note (Visible to Teacher)
                  </Label>
                  <Textarea
                    placeholder="Provide a reason or confirmation number..."
                    className="bg-white border-slate-200 min-h-[80px]"
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="p-6 pt-2 border-t bg-slate-50/80">
              <Button
                type="button"
                variant="ghost"
                className="text-slate-500 hover:text-slate-700 h-11"
                onClick={() => setSelectedReview(null)}
              >
                Close
              </Button>
              <Button
                type="button"
                onClick={handleReviewSubmit}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11 px-8 shadow-lg shadow-indigo-100 transition-all active:scale-[0.98]"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
