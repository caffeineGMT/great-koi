# Great Koi - n8n Automation Workflows

## 1. Daily Community Wish Digest
**Trigger**: Schedule (daily, 9 AM PT)
**Flow**:
1. Fetch `/api/wishes` → GET last 50 community wishes
2. AI Node → Generate a "Daily Koi Wisdom" post from wish themes
3. Post to Instagram (@greatkoi.app) + Twitter
4. Store post metadata for analytics

## 2. Weekly Growth Report
**Trigger**: Schedule (Mondays, 8 AM PT)
**Flow**:
1. Fetch `/api/analytics` → GET weekly stats
2. AI Node → Generate growth insights summary
3. Email to admin (michaelguo@meta.com)
4. Track in Google Sheets

## 3. Waitlist Nurture
**Trigger**: Webhook (from `/api/waitlist` POST)
**Flow**:
1. Receive new email signup
2. Send welcome email via SendGrid/Resend
3. Add to email list (ConvertKit/Mailchimp)
4. Schedule follow-up sequence (Day 1, Day 3, Day 7)

## 4. Social Content Pipeline
**Trigger**: Schedule (3x/week - Mon, Wed, Fri at 10 AM PT)
**Flow**:
1. AI Node → Generate zen/koi themed content concept
2. Manus → Generate beautiful koi/pond artwork
3. AI Node → Generate caption (4 variants: witty, heartfelt, minimal, bold)
4. Save to GitHub (content queue)
5. Create review issue on GitHub
6. After approval → Post to Instagram + Twitter

## 5. Premium Conversion Nudge
**Trigger**: Schedule (weekly check)
**Flow**:
1. Fetch analytics for users at 3/3 wishes (hit paywall)
2. AI Node → Generate personalized re-engagement message
3. If email captured → Send "unlock more wishes" email
4. Track conversion funnel

## API Endpoints Used
- `GET /api/wishes` - Community wishes
- `POST /api/wishes` - Submit wish
- `GET /api/analytics` - Usage analytics
- `POST /api/analytics` - Track events
- `POST /api/waitlist` - Email capture
- `POST /api/checkout` - Stripe subscription

## Social Accounts (To Create)
- Instagram: @greatkoi.app
- Twitter/X: @greatkoi_app
- TikTok: @greatkoi (zen pond ASMR clips)

## Content Strategy
- **Instagram**: Artistic koi pond renders, wish quotes overlaid on nature
- **Twitter**: Daily zen wisdom + link to app
- **TikTok**: 15-30s ambient koi pond loops with soft music
- **SEO**: Blog posts on digital wellness, mindfulness, wish-making traditions
