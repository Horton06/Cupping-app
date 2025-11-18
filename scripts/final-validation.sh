#!/bin/bash
# scripts/final-validation.sh
# Comprehensive validation suite for Cupper App

set -e  # Exit on error

echo "🚀 CUPPER APP - FINAL VALIDATION SUITE"
echo "======================================"
echo ""

# Create reports directory
mkdir -p reports

# Phase 1: Code Quality
echo "📋 Phase 1: Code Quality Audit..."
echo "-----------------------------------"

echo "  → Running TypeScript type check..."
npx tsc --noEmit > reports/typescript.txt 2>&1 || echo "TypeScript errors found" > reports/typescript-errors.txt

echo "  → Running ESLint..."
npx eslint . --ext .ts,.tsx --format json > reports/eslint.json 2>&1 || echo "ESLint errors found" > reports/eslint-errors.txt
npx eslint . --ext .ts,.tsx > reports/eslint.txt 2>&1 || true

echo "  → Checking for unused exports..."
npx ts-prune > reports/unused-exports.txt 2>&1 || echo "ts-prune not installed"

echo "  → Checking for unused dependencies..."
npx depcheck --json > reports/unused-deps.json 2>&1 || echo "depcheck not installed"

echo "  ✓ Phase 1 complete"
echo ""

# Phase 2: Testing
echo "🧪 Phase 2: Testing Validation..."
echo "-----------------------------------"

if [ -d "__tests__" ] || [ -d "src/__tests__" ]; then
  echo "  → Running test suite..."
  npm test -- --coverage --watchAll=false --coverageReporters=json-summary --passWithNoTests > reports/tests.txt 2>&1 || echo "Tests failed" > reports/tests-failed.txt
  echo "  ✓ Tests complete"
else
  echo "  ⚠ No tests directory found - skipping"
  echo "No tests configured yet" > reports/tests.txt
fi

echo ""

# Phase 3: Performance
echo "⚡ Phase 3: Performance Analysis..."
echo "-----------------------------------"

if [ -f "scripts/performance-benchmark.ts" ]; then
  echo "  → Running performance benchmarks..."
  npx ts-node scripts/performance-benchmark.ts > reports/performance.txt 2>&1 || echo "Benchmark failed"
else
  echo "  ⚠ Performance benchmark script not found"
  echo "Performance benchmark script needs to be created" > reports/performance.txt
fi

echo "  ✓ Phase 3 complete"
echo ""

# Phase 4: Security
echo "🔒 Phase 4: Security Audit..."
echo "-----------------------------------"

echo "  → Running npm audit..."
npm audit --json > reports/security-audit.json 2>&1 || true
npm audit > reports/security-audit.txt 2>&1 || true

echo "  → Checking for sensitive files..."
echo "Checking for .env files, API keys, secrets..." > reports/security-checklist.txt
grep -r "API_KEY\|SECRET\|PASSWORD" --include="*.ts" --include="*.tsx" src/ >> reports/security-checklist.txt 2>&1 || echo "No hardcoded secrets found" >> reports/security-checklist.txt

echo "  ✓ Phase 4 complete"
echo ""

# Phase 5: Build Analysis
echo "📦 Phase 5: Build Analysis..."
echo "-----------------------------------"

echo "  → Analyzing bundle size (iOS)..."
npx expo export --platform ios --output-dir dist/ios > reports/build-ios.txt 2>&1 || echo "iOS export failed" > reports/build-ios-failed.txt

echo "  → Analyzing bundle size (Android)..."
npx expo export --platform android --output-dir dist/android > reports/build-android.txt 2>&1 || echo "Android export failed" > reports/build-android-failed.txt

if [ -d "dist" ]; then
  echo "  → Calculating bundle sizes..."
  du -sh dist/ios > reports/bundle-sizes.txt 2>&1 || true
  du -sh dist/android >> reports/bundle-sizes.txt 2>&1 || true
fi

echo "  ✓ Phase 5 complete"
echo ""

# Generate summary report
echo "📊 Generating Summary Report..."
echo "-----------------------------------"

if [ -f "scripts/generate-validation-report.js" ]; then
  node scripts/generate-validation-report.js
else
  echo "⚠ Report generator not found - creating basic summary..."

  cat > reports/SUMMARY.md << 'EOF'
# Validation Report Summary

Generated: $(date)

## Phase 1: Code Quality
- TypeScript: See typescript.txt
- ESLint: See eslint.txt
- Unused exports: See unused-exports.txt
- Unused dependencies: See unused-deps.json

## Phase 2: Testing
- Test results: See tests.txt

## Phase 3: Performance
- Performance benchmarks: See performance.txt

## Phase 4: Security
- npm audit: See security-audit.txt
- Security checklist: See security-checklist.txt

## Phase 5: Build
- iOS build: See build-ios.txt
- Android build: See build-android.txt
- Bundle sizes: See bundle-sizes.txt

---

Review individual report files in the reports/ directory for details.
EOF
fi

echo ""
echo "✅ Validation Complete!"
echo ""
echo "📁 Reports available in: ./reports/"
echo ""
echo "Next steps:"
echo "  1. Review reports/SUMMARY.md"
echo "  2. Fix any critical issues found"
echo "  3. Execute manual QA testing (Phase 4)"
echo "  4. Complete accessibility audit (Phase 5)"
echo ""
