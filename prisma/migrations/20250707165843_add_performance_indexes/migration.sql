-- CreateIndex
CREATE INDEX "user_event_missions_userId_eventId_idx" ON "user_event_missions"("userId", "eventId");

-- CreateIndex
CREATE INDEX "user_event_missions_userId_eventId_completed_idx" ON "user_event_missions"("userId", "eventId", "completed");

-- CreateIndex
CREATE INDEX "user_event_missions_userId_expiresAt_idx" ON "user_event_missions"("userId", "expiresAt");

-- CreateIndex
CREATE INDEX "user_missions_userId_completed_idx" ON "user_missions"("userId", "completed");

-- CreateIndex
CREATE INDEX "user_missions_userId_expiresAt_idx" ON "user_missions"("userId", "expiresAt");

-- CreateIndex
CREATE INDEX "user_missions_userId_createdAt_idx" ON "user_missions"("userId", "createdAt");
