# Business Directory Module

This document provides an overview of the Business Directory Module implementation.

## Overview

A comprehensive marketplace/directory system where users can create business accounts, subscribe to plans, post products/services, and receive reviews. Supports location-based search with flexible ranking algorithms.

## Database Schema

Run the SQL schema file to set up all tables:

```sql

/scripts/business_directory_schema.sql

```

This creates the following tables:

- `category` - Hierarchical category system
- `business` - Main business entity
- `business_category` - Many-to-many relationship
- `subscription_plan` - Available subscription tiers
- `business_subscription` - Active subscriptions
- `payment` - Payment records
- `post` - Posts and products
- `product_details` - Product-specific information
- `business_review` - Reviews and ratings
- `business_media` - Additional media files

## API Services

All API services are located in `src/lib/api/`:

- **CategoryService** (`category.ts`) - Manage categories and hierarchy
- **BusinessService** (`business.ts`) - Business CRUD operations, search, ranking
- **SubscriptionPlanService** (`subscription.ts`) - Manage subscription plans
- **BusinessSubscriptionService** (`subscription.ts`) - Handle business subscriptions
- **PaymentService** (`payment.ts`) - Process payments (Stripe/manual)
- **PostService** (`post.ts`) - Manage posts and products
- **BusinessReviewService** (`businessReview.ts`) - Handle reviews and ratings

## UI Components

All components are located in `src/components/business/`:

- **BusinessForm** - Create/edit business form with category selector
- **BusinessList** - List all businesses with filters
- **PostForm** - Create/edit posts and products
- **PostList** - List all posts/products with filters
- **SubscriptionPlanSelector** - Select subscription plan
- **PaymentFlow** - Multi-step payment process
- **ReviewForm** - Submit business reviews
- **ReviewDisplay** - Display business reviews
- **CategoryManagement** - Admin interface for managing categories
- **BusinessModeration** - Verify businesses and moderate reviews

## Pages

All pages are located in `app/dashboard/business/`:

- `/dashboard/business` - Main business dashboard
- `/dashboard/business/list` - Business list page
- `/dashboard/business/posts` - Posts & Products list page
- `/dashboard/business/categories` - Category management page
- `/dashboard/business/moderation` - Business moderation page

## Features

### Business Management

- Create and edit businesses with location data
- Hierarchical category assignment
- Business verification system
- Rating and review aggregation

### Subscription System

- Multiple subscription tiers
- Monthly/yearly billing cycles
- Feature-based limits (products, analytics, featured listing)
- Payment tracking

### Posts & Products

- Unified post system (regular posts or products)
- Product details with inventory tracking
- Image galleries
- Featured posts

### Reviews & Ratings

- 5-star rating system
- Text reviews with images
- Verified purchase badges
- Admin moderation
- Helpful votes

### Search & Ranking

- Location-based search with distance calculation
- Flexible ranking algorithm considering:
  - Subscription tier
  - Rating average and count
  - Verification status
  - View count
  - Distance (for location searches)

## Usage Examples

### Creating a Business

```typescript
import { BusinessService } from '@lib/api/business'

const business = await BusinessService.create({
  business_name: 'My Business',
  description: 'Business description',
  category_ids: ['category-id-1', 'category-id-2'],
  primary_category_id: 'category-id-1',
  // ... other fields
})
```

### Searching Businesses

```typescript
const results = await BusinessService.search({
  search: 'restaurant',
  lat: 40.7128,
  lng: -74.006,
  radius: 10, // km
  sort_by: 'distance',
})
```

### Creating a Subscription

```typescript
import { BusinessSubscriptionService } from '@lib/api/subscription'

const subscription = await BusinessSubscriptionService.create({
  business_id: 'business-id',
  plan_id: 'plan-id',
  billing_cycle: 'monthly',
})
```

## Stripe Integration

The Stripe integration is set up with placeholders. To complete:

1. Install Stripe: `npm install stripe`
2. Set environment variables:
   - `STRIPE_SECRET_KEY` (server-side)
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (client-side)
3. Implement Stripe SDK in `src/lib/api/stripe.ts`
4. Use Stripe Elements in payment forms

## Next Steps

1. Run the SQL schema file in your Supabase database
2. Set up Stripe integration (if using)
3. Configure environment variables
4. Customize ranking algorithm weights as needed
5. Add business hours and social links features (optional)
