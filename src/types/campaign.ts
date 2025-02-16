import { Coupon } from "./coupon"

export interface Campaign {
  campaign_id: string
  client_id: string
  name: string
  description: string
  requires_phone: boolean
  requires_questions: boolean
  coupons: Coupon[]
}

