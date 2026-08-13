# Database Specification

## Principles

- Use PostgreSQL `numeric(14,2)` for money.
- Use UUID primary keys and `timestamptz` timestamps.
- Every personal table has `user_id` and RLS enabled.
- Store transaction date separately from creation time.

## Tables

### profiles

`id uuid primary key references auth.users(id)`, `full_name`, `email`, `avatar_url`, `currency_code default 'IDR'`, timestamps.

### accounts

`id`, `user_id`, `name`, `type (cash|bank|ewallet|other)`, `opening_balance numeric(14,2)`, `is_archived`, timestamps.

### categories

`id`, `user_id`, `name`, `type (income|expense)`, `color`, `icon`, `is_default`, timestamps.

### transactions

`id`, `user_id`, `account_id`, `category_id`, `type`, `amount numeric(14,2)`, `transaction_date date`, `payment_method`, `description`, `attachment_path`, `deleted_at`, timestamps.

### budgets

`id`, `user_id`, `category_id`, `period_start`, `period_end`, `amount`, timestamps.

### savings_goals

`id`, `user_id`, `name`, `target_amount`, `current_amount`, `deadline`, `status`, timestamps.

## Constraints and indexes

Amount must be greater than zero. Transaction type and category type must agree. Add indexes on `(user_id, transaction_date desc)`, `(user_id, type)`, `(user_id, category_id)`, and `(user_id, deleted_at)`.

## RLS model

For every personal table, select/update/delete require `auth.uid() = user_id`; insert requires inserted `user_id = auth.uid()`. Profiles use `id = auth.uid()`.

## Balance

`balance = opening balances + income - expense` for non-deleted transactions. Prefer deriving it from source data rather than persisting a mutable balance.

## Migrations

Use timestamped SQL migrations. Test each migration against both a fresh and an existing database.
