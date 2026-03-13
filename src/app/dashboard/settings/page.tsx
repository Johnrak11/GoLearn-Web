"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/lib/axios";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const paymentConfigSchema = z.object({
  bakongAccountId: z.string().min(1, { message: "Account ID is required" }),
  merchantName: z.string().min(1, { message: "Merchant Name is required" }),
  merchantCity: z.string().min(1, { message: "City is required" }),
  telegramChatId: z.string().optional(),
});

type PaymentConfigFormValues = z.infer<typeof paymentConfigSchema>;

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const form = useForm<PaymentConfigFormValues>({
    resolver: zodResolver(paymentConfigSchema),
    defaultValues: {
      bakongAccountId: "",
      merchantName: "",
      merchantCity: "",
      telegramChatId: "",
    },
  });

  useEffect(() => {
    async function fetchConfig() {
      try {
        const response = await api.get("/admin/payment-config");
        if (response.data) {
          form.reset({
            bakongAccountId: response.data.bakongAccountId || "",
            merchantName: response.data.merchantName || "",
            merchantCity: response.data.merchantCity || "",
            telegramChatId: response.data.telegramChatId || "",
          });
        }
      } catch (error) {
        console.error("Failed to fetch payment config", error);
      } finally {
        setFetching(false);
      }
    }
    fetchConfig();
  }, [form]);

  async function onSubmit(data: PaymentConfigFormValues) {
    setLoading(true);
    try {
      await api.put("/admin/payment-config", data);
      alert("Payment configuration saved successfully!");
    } catch (error) {
      console.error("Failed to save config", error);
      alert("Failed to save config. See console.");
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return <div className="p-6">Loading settings...</div>;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Platform Settings</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bakong Payment Configuration</CardTitle>
          <CardDescription>
            Update your KHQR merchant details. This information will be used
            when generating payment QR codes for students.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="bakongAccountId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bakong Account ID</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. john_doe@acleda" {...field} />
                    </FormControl>
                    <FormDescription>
                      The Bakong ID where funds will be received.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="merchantName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Merchant Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. DevAcademy Platform"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The name that will appear on the student's banking app.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="merchantCity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Merchant City</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Phnom Penh" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="telegramChatId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telegram Chat ID (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="-10012345678" {...field} />
                      </FormControl>
                      <FormDescription>
                        For receiving payment notifications.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save Configuration"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
