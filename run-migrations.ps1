# Run Supabase Migrations for Contact, Requests, and Reminders

Write-Host "Running Supabase migrations..." -ForegroundColor Cyan

# Check if supabase CLI is installed
if (!(Get-Command supabase -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Supabase CLI not found. Install it first:" -ForegroundColor Red
    Write-Host "  npm install -g supabase" -ForegroundColor Yellow
    Write-Host "  Or visit: https://supabase.com/docs/guides/cli" -ForegroundColor Yellow
    exit 1
}

# Check if we're linked to a project
$linkStatus = supabase projects list 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Not logged in to Supabase." -ForegroundColor Red
    Write-Host "Run: supabase login" -ForegroundColor Yellow
    exit 1
}

Write-Host "`nMigration 1: Creating inquiries table..." -ForegroundColor Green
supabase db push --db-url "$(supabase status --output json | ConvertFrom-Json | Select-Object -ExpandProperty db_url)" --include-all

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Migrations applied successfully!" -ForegroundColor Green
    Write-Host "`nTables created:" -ForegroundColor Cyan
    Write-Host "  - inquiries (contact form submissions)" -ForegroundColor White
    Write-Host "  - booking_requests (special requests)" -ForegroundColor White
    Write-Host "  - reminders (automated notifications)" -ForegroundColor White
    Write-Host "`nNext steps:" -ForegroundColor Cyan
    Write-Host "  1. Deploy send-reminders function: supabase functions deploy send-reminders" -ForegroundColor White
    Write-Host "  2. Test contact form on your site" -ForegroundColor White
    Write-Host "  3. Set up cron or manual trigger for send-reminders function" -ForegroundColor White
} else {
    Write-Host "✗ Migration failed. Check errors above." -ForegroundColor Red
    Write-Host "`nAlternative: Run migrations manually in Supabase Dashboard:" -ForegroundColor Yellow
    Write-Host "  1. Go to https://supabase.com/dashboard" -ForegroundColor White
    Write-Host "  2. Select your project" -ForegroundColor White
    Write-Host "  3. Go to SQL Editor" -ForegroundColor White
    Write-Host "  4. Copy and paste each migration file" -ForegroundColor White
    Write-Host "  5. Run them in order (001, 002, 003)" -ForegroundColor White
}
