import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Crown,
  ShieldAlert,
  ArrowRight,
  RefreshCcw,
  Phone,
  Mail,
  MessageCircle,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Props {
  type: "expired" | "upgrade";
}

export default function PlanAccessRequired({ type }: Props) {
  const navigate = useNavigate();

  const isExpired = type === "expired";

  const [showContactCard, setShowContactCard] = useState(false);

  // Replace these with your actual details
  const SALES_DETAILS = {
    phone: "+91 9276969696",
    email: "contactus@demokrito.com",
    whatsapp: "919276969696", // Only country code + number
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-muted/20 px-3 py-4 sm:px-6 sm:py-8">
      <Card className="w-full max-w-xl overflow-hidden rounded-2xl sm:rounded-3xl border shadow-xl">
        {!showContactCard ? (
          <>
            {/* Top Gradient */}
            <div
              className={`h-2 ${
                isExpired
                  ? "bg-gradient-to-r from-red-500 to-orange-500"
                  : "bg-gradient-to-r from-violet-600 to-indigo-600"
              }`}
            />

            <CardContent className="p-5 sm:p-8 lg:p-10">
              {/* Icon */}

              <div
                className={`mx-auto flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full ${
                  isExpired ? "bg-red-100" : "bg-violet-100"
                }`}
              >
                {isExpired ? (
                  <ShieldAlert className="h-10 w-10 sm:h-12 sm:w-12 text-red-600" />
                ) : (
                  <Crown className="h-10 w-10 sm:h-12 sm:w-12 text-violet-600" />
                )}
              </div>

              {/* Title */}

              <h1 className="mt-6 text-center text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
                {isExpired
                  ? "Your Subscription Has Expired"
                  : "Advanced Feature"}
              </h1>

              {/* Description */}

              <p className="mt-4 text-center text-sm sm:text-base lg:text-lg leading-6 sm:leading-7 text-muted-foreground">
                {isExpired
                  ? "Your subscription has expired. Renew your plan to continue using all platform features without interruption."
                  : "This feature is available only on higher subscription plans. Upgrade your plan to unlock advanced capabilities."}
              </p>

              {/* Benefits */}

              <div className="mt-6 rounded-xl border bg-muted/40 p-4 sm:p-6">
                <h3 className="mb-3 text-base sm:text-lg font-semibold">
                  {isExpired
                    ? "After renewing you'll get:"
                    : "Upgrade and unlock:"}
                </h3>

                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✓ Unlimited premium features</li>
                  <li>✓ Higher usage limits</li>
                  <li>✓ Priority customer support</li>
                  <li>✓ Future updates & premium modules</li>
                </ul>
              </div>

              {/* Buttons */}

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  className="h-11 sm:h-12 flex-1 text-sm sm:text-base"
                  onClick={() => setShowContactCard(true)}
                >
                  {isExpired ? (
                    <>
                      <RefreshCcw className="mr-2 h-5 w-5" />
                      Renew Plan
                    </>
                  ) : (
                    <>
                      <Crown className="mr-2 h-5 w-5" />
                      Upgrade Plan
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  className="h-11 sm:h-12 flex-1 text-sm sm:text-base"
                  onClick={() => navigate(-1)}
                >
                  Go Back
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </>
        ) : (
          <>
            {/* Top Gradient */}
            <div className="h-2 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500" />

            <CardContent className="p-5 sm:p-8">
              {/* Icon */}

              <div className="mx-auto flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-green-100">
                <MessageCircle className="h-8 w-8 sm:h-10 sm:w-10 text-green-600" />
              </div>

              {/* Heading */}

              <h2 className="mt-5 text-center text-2xl sm:text-3xl font-bold">
                Contact Sales
              </h2>

              <p className="mx-auto mt-3 max-w-md text-center text-sm sm:text-base text-muted-foreground leading-6">
                Our sales team will help you choose the right subscription plan
                for your business.
              </p>

              {/* Contact Details */}

              <div className="mt-8 overflow-hidden rounded-2xl border bg-background">
                {/* Phone */}

                <div className="flex items-center gap-4 p-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 shrink-0">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Phone
                    </p>

                    <p className="font-semibold text-base break-all">
                      {SALES_DETAILS.phone}
                    </p>
                  </div>
                </div>

                <div className="border-t" />

                {/* Email */}

                <div className="flex items-center gap-4 p-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 shrink-0">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Email
                    </p>

                    <p className="font-semibold text-sm sm:text-base break-all">
                      {SALES_DETAILS.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}

              <div className="mt-8 space-y-3">
                <Button
                  className="w-full h-11 sm:h-12 bg-green-600 hover:bg-green-700"
                  onClick={() =>
                    window.open(
                      `https://wa.me/${SALES_DETAILS.whatsapp}`,
                      "_blank",
                    )
                  }
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Chat on WhatsApp
                </Button>

                <Button
                  variant="outline"
                  className="w-full h-11 sm:h-12"
                  onClick={() =>
                    (window.location.href = `mailto:${SALES_DETAILS.email}`)
                  }
                >
                  <Mail className="mr-2 h-5 w-5" />
                  Send Email
                </Button>

                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => setShowContactCard(false)}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              </div>

              {/* Footer */}

              <p className="mt-6 text-center text-xs text-muted-foreground">
                Our team usually responds within one business day.
              </p>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
