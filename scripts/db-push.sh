#!/bin/bash
# Push migrations to remote Supabase project

set -e

echo "🔄 Pushing migrations to Supabase..."

# Check if linked to project
if ! npx supabase projects list &>/dev/null; then
  echo "❌ Not logged in. Run: npx supabase login"
  exit 1
fi

# Push migrations
npx supabase db push

echo "✅ Migrations pushed successfully!"
