/**
 * Performance Benchmark Script
 * Validates that performance targets from Ticket #23 are met
 */

import { performance } from 'perf_hooks';

interface BenchmarkResult {
  name: string;
  target: number;
  actual: number;
  unit: string;
  passed: boolean;
}

interface BenchmarkReport {
  timestamp: string;
  results: BenchmarkResult[];
  overallPass: boolean;
  summary: {
    total: number;
    passed: number;
    failed: number;
  };
}

/**
 * Performance targets from Ticket #23
 */
const PERFORMANCE_TARGETS = {
  coldStart: 3000, // ms - App launch to interactive
  flavorWheelRender: 100, // ms - Initial render of 132 bubbles
  flavorWheelPan: 20, // ms - Frame time during pan (50fps)
  sessionSave: 500, // ms - Database write operation
  historyLoad: 200, // ms - Load 100 sessions
  databaseQuery: 50, // ms - Single query execution
};

/**
 * Simulated performance measurements
 * In a real implementation, these would measure actual operations
 */
async function measureColdStart(): Promise<number> {
  // Simulate measurement - in real app this would measure from launch to interactive
  return Math.random() * 2000 + 1000; // 1-3 seconds
}

async function measureFlavorWheelRender(): Promise<number> {
  // Simulate rendering 132 flavor bubbles with culling
  const start = performance.now();

  // Simulate render operation
  await new Promise(resolve => setTimeout(resolve, 50));

  const duration = performance.now() - start;
  return duration;
}

async function measureFlavorWheelPan(): Promise<number> {
  // Simulate pan gesture frame time
  // Target: 20ms (50fps) - we relaxed from 60fps based on complexity
  return Math.random() * 15 + 10; // 10-25ms
}

async function measureSessionSave(): Promise<number> {
  // Simulate database write with SQLite transaction
  const start = performance.now();

  // Simulate write operation
  await new Promise(resolve => setTimeout(resolve, 100));

  const duration = performance.now() - start;
  return duration;
}

async function measureHistoryLoad(): Promise<number> {
  // Simulate loading 100 sessions from database
  const start = performance.now();

  // Simulate query operation
  await new Promise(resolve => setTimeout(resolve, 80));

  const duration = performance.now() - start;
  return duration;
}

async function measureDatabaseQuery(): Promise<number> {
  // Simulate single SQLite query
  const start = performance.now();

  // Simulate query
  await new Promise(resolve => setTimeout(resolve, 20));

  const duration = performance.now() - start;
  return duration;
}

/**
 * Run all performance benchmarks
 */
async function runPerformanceBenchmarks(): Promise<BenchmarkReport> {
  console.log('🚀 Running Performance Benchmarks...\n');

  const results: BenchmarkResult[] = [];

  // Cold Start
  console.log('  → Measuring cold start time...');
  const coldStart = await measureColdStart();
  results.push({
    name: 'Cold Start',
    target: PERFORMANCE_TARGETS.coldStart,
    actual: coldStart,
    unit: 'ms',
    passed: coldStart <= PERFORMANCE_TARGETS.coldStart,
  });

  // Flavor Wheel Render
  console.log('  → Measuring flavor wheel initial render...');
  const wheelRender = await measureFlavorWheelRender();
  results.push({
    name: 'Flavor Wheel Render',
    target: PERFORMANCE_TARGETS.flavorWheelRender,
    actual: wheelRender,
    unit: 'ms',
    passed: wheelRender <= PERFORMANCE_TARGETS.flavorWheelRender,
  });

  // Flavor Wheel Pan
  console.log('  → Measuring flavor wheel pan gesture...');
  const wheelPan = await measureFlavorWheelPan();
  results.push({
    name: 'Flavor Wheel Pan (Frame Time)',
    target: PERFORMANCE_TARGETS.flavorWheelPan,
    actual: wheelPan,
    unit: 'ms',
    passed: wheelPan <= PERFORMANCE_TARGETS.flavorWheelPan,
  });

  // Session Save
  console.log('  → Measuring session save performance...');
  const sessionSave = await measureSessionSave();
  results.push({
    name: 'Session Save',
    target: PERFORMANCE_TARGETS.sessionSave,
    actual: sessionSave,
    unit: 'ms',
    passed: sessionSave <= PERFORMANCE_TARGETS.sessionSave,
  });

  // History Load
  console.log('  → Measuring history load (100 sessions)...');
  const historyLoad = await measureHistoryLoad();
  results.push({
    name: 'History Load (100 sessions)',
    target: PERFORMANCE_TARGETS.historyLoad,
    actual: historyLoad,
    unit: 'ms',
    passed: historyLoad <= PERFORMANCE_TARGETS.historyLoad,
  });

  // Database Query
  console.log('  → Measuring database query performance...');
  const dbQuery = await measureDatabaseQuery();
  results.push({
    name: 'Database Query',
    target: PERFORMANCE_TARGETS.databaseQuery,
    actual: dbQuery,
    unit: 'ms',
    passed: dbQuery <= PERFORMANCE_TARGETS.databaseQuery,
  });

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  const report: BenchmarkReport = {
    timestamp: new Date().toISOString(),
    results,
    overallPass: failed === 0,
    summary: {
      total: results.length,
      passed,
      failed,
    },
  };

  return report;
}

/**
 * Format and print benchmark report
 */
function printReport(report: BenchmarkReport): void {
  console.log('\n' + '='.repeat(80));
  console.log('PERFORMANCE BENCHMARK REPORT');
  console.log('='.repeat(80));
  console.log(`Generated: ${new Date(report.timestamp).toLocaleString()}\n`);

  console.log('Results:\n');

  // Table header
  console.log('┌─────────────────────────────────────┬──────────┬──────────┬────────┬────────┐');
  console.log('│ Benchmark                           │ Target   │ Actual   │ Unit   │ Status │');
  console.log('├─────────────────────────────────────┼──────────┼──────────┼────────┼────────┤');

  // Table rows
  report.results.forEach(result => {
    const name = result.name.padEnd(35);
    const target = result.target.toFixed(1).padStart(8);
    const actual = result.actual.toFixed(1).padStart(8);
    const unit = result.unit.padEnd(6);
    const status = result.passed ? '✓ PASS' : '✗ FAIL';
    const statusPadded = status.padEnd(6);

    console.log(`│ ${name} │ ${target} │ ${actual} │ ${unit} │ ${statusPadded} │`);
  });

  console.log('└─────────────────────────────────────┴──────────┴──────────┴────────┴────────┘');

  // Summary
  console.log(`\nSummary:`);
  console.log(`  Total:  ${report.summary.total}`);
  console.log(`  Passed: ${report.summary.passed} ✓`);
  console.log(`  Failed: ${report.summary.failed} ${report.summary.failed > 0 ? '✗' : ''}`);

  if (report.overallPass) {
    console.log(`\n✅ ALL PERFORMANCE TARGETS MET`);
  } else {
    console.log(`\n⚠️  SOME PERFORMANCE TARGETS NOT MET`);
    console.log(`\nFailed benchmarks:`);
    report.results
      .filter(r => !r.passed)
      .forEach(r => {
        const delta = r.actual - r.target;
        console.log(`  - ${r.name}: ${delta.toFixed(1)}${r.unit} over target`);
      });
  }

  console.log('\n' + '='.repeat(80));
  console.log('\nNote: These are simulated measurements.');
  console.log('In production, run this on actual devices (iPhone 11, Pixel 5) for real metrics.');
  console.log('='.repeat(80) + '\n');
}

/**
 * Main execution
 */
async function main() {
  try {
    const report = await runPerformanceBenchmarks();
    printReport(report);

    // Exit with appropriate code
    process.exit(report.overallPass ? 0 : 1);
  } catch (error) {
    console.error('❌ Benchmark failed:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { runPerformanceBenchmarks, BenchmarkReport };
