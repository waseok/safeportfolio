import { cookies } from "next/headers";
import { ReviewModeBanner } from "@/components/review-mode-banner";
import { REVIEW_COOKIE, isReviewRole } from "@/lib/review-demo";

/** 심사 모드일 때 상단 안내 배너 */
export async function ReviewModeBannerSlot() {
  const cookieStore = await cookies();
  const role = cookieStore.get(REVIEW_COOKIE)?.value;
  if (!isReviewRole(role)) return null;

  return <ReviewModeBanner role={role} />;
}
