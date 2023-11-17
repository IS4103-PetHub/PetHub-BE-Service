-- CreateTable
CREATE TABLE "NewsletterSubscription" (
    "newsletterSubscriptionId" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "dateSubscribed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NewsletterSubscription_pkey" PRIMARY KEY ("newsletterSubscriptionId")
);

-- CreateIndex
CREATE UNIQUE INDEX "NewsletterSubscription_email_key" ON "NewsletterSubscription"("email");
