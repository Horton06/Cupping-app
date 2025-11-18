/**
 * Analytics Service
 *
 * Provides data aggregation and analytics for coffee tasting sessions.
 * Optimized queries for < 50ms performance.
 */

import { getDatabase } from './database/connection';
import type {
  Session,
  StructuralScores,
  SessionType,
} from '../types/session.types';
import { sessionService } from './sessionService';
import { flavorService } from './flavorService';

/**
 * Session statistics
 */
export interface SessionStats {
  totalFlavors: number;
  uniqueFlavors: number;
  averageScores: StructuralScores;
  totalScore: number;
  topCategories: Array<{ category: string; count: number }>;
  duration?: number; // Minutes between created_at and updated_at
}

/**
 * Flavor frequency data
 */
export interface FlavorFrequency {
  flavorId: number;
  flavorName: string;
  category: string;
  count: number;
  averageIntensity: number;
}

/**
 * Uniformity score for table cupping
 */
export interface UniformityScore {
  coffeeId: string;
  coffeeName: string;
  uniformityScore: number; // 0-100, higher = more uniform
  cupScores: Array<{
    cupId: string;
    position: number;
    totalScore: number;
  }>;
  standardDeviation: number;
}

/**
 * Coffee comparison data
 */
export interface CoffeeComparison {
  coffee1: {
    coffeeId: string;
    name: string;
    averageScores: StructuralScores;
    totalScore: number;
    flavors: number[];
  };
  coffee2: {
    coffeeId: string;
    name: string;
    averageScores: StructuralScores;
    totalScore: number;
    flavors: number[];
  };
  scoreDelta: {
    acidity: number;
    sweetness: number;
    body: number;
    clarity: number;
    finish: number;
    enjoyment: number;
    total: number;
  };
  sharedFlavors: number[];
  uniqueToCoffee1: number[];
  uniqueToCoffee2: number[];
}

class AnalyticsService {
  /**
   * Get comprehensive statistics for a session.
   *
   * @param sessionId - Session ID
   * @returns Session statistics including averages, totals, and top categories
   */
  async getSessionStats(sessionId: string): Promise<SessionStats | null> {
    const session = await sessionService.getSession(sessionId);
    if (!session) return null;

    const db = await getDatabase();

    // Get flavor count and unique flavors
    const flavorResult = await new Promise<{
      totalFlavors: number;
      uniqueFlavors: number;
    }>((resolve) => {
      db.transactionAsync(async tx => {
        const result = await tx.executeSqlAsync(
          `SELECT
             COUNT(DISTINCT sf.flavor_id) as uniqueFlavors,
             COUNT(sf.flavor_id) as totalFlavors
           FROM selected_flavors sf
           JOIN cups c ON sf.cup_id = c.id
           JOIN coffees co ON c.coffee_id = co.id
           WHERE co.session_id = ?`,
          [sessionId]
        );

        if (result.rows && result.rows.length > 0) {
          const row = result.rows[0] as { uniqueFlavors: number; totalFlavors: number };
          resolve({
            totalFlavors: row.totalFlavors || 0,
            uniqueFlavors: row.uniqueFlavors || 0,
          });
        } else {
          resolve({ totalFlavors: 0, uniqueFlavors: 0 });
        }
      }, false);
    });

    // Calculate average scores across all cups
    let totalAcidity = 0;
    let totalSweetness = 0;
    let totalBody = 0;
    let totalClarity = 0;
    let totalFinish = 0;
    let totalEnjoyment = 0;
    let cupCount = 0;

    for (const coffee of session.coffees) {
      for (const cup of coffee.cups) {
        totalAcidity += cup.ratings.acidity || 0;
        totalSweetness += cup.ratings.sweetness || 0;
        totalBody += cup.ratings.body || 0;
        totalClarity += cup.ratings.clarity || 0;
        totalFinish += cup.ratings.finish || 0;
        totalEnjoyment += cup.ratings.enjoyment || 0;
        cupCount++;
      }
    }

    const averageScores: StructuralScores = {
      acidity: cupCount > 0 ? Math.round((totalAcidity / cupCount) * 10) / 10 as 1 | 2 | 3 | 4 | 5 : 3,
      sweetness: cupCount > 0 ? Math.round((totalSweetness / cupCount) * 10) / 10 as 1 | 2 | 3 | 4 | 5 : 3,
      body: cupCount > 0 ? Math.round((totalBody / cupCount) * 10) / 10 as 1 | 2 | 3 | 4 | 5 : 3,
      clarity: cupCount > 0 ? Math.round((totalClarity / cupCount) * 10) / 10 as 1 | 2 | 3 | 4 | 5 : 3,
      finish: cupCount > 0 ? Math.round((totalFinish / cupCount) * 10) / 10 as 1 | 2 | 3 | 4 | 5 : 3,
      enjoyment: cupCount > 0 ? Math.round((totalEnjoyment / cupCount) * 10) / 10 as 1 | 2 | 3 | 4 | 5 : 3,
    };

    const totalScore =
      totalAcidity + totalSweetness + totalBody + totalClarity + totalFinish + totalEnjoyment;

    // Get top categories
    const topCategories = await this.getTopCategories(sessionId, 5);

    // Calculate duration
    const createdAt = new Date(session.createdAt);
    const updatedAt = new Date(session.updatedAt);
    const duration = Math.round((updatedAt.getTime() - createdAt.getTime()) / 60000); // Minutes

    return {
      totalFlavors: flavorResult.totalFlavors,
      uniqueFlavors: flavorResult.uniqueFlavors,
      averageScores,
      totalScore,
      topCategories,
      duration,
    };
  }

  /**
   * Get flavor frequency across all sessions or filtered sessions.
   *
   * @param filters - Optional filters (session type, date range, etc.)
   * @returns Array of flavors with usage counts and average intensity
   */
  async getFlavorFrequency(filters?: {
    sessionType?: SessionType;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<FlavorFrequency[]> {
    const db = await getDatabase();

    let query = `
      SELECT
        sf.flavor_id as flavorId,
        COUNT(sf.flavor_id) as count,
        AVG(sf.intensity) as averageIntensity
      FROM selected_flavors sf
      JOIN cups c ON sf.cup_id = c.id
      JOIN coffees co ON c.coffee_id = co.id
      JOIN sessions s ON co.session_id = s.id
      WHERE 1=1
    `;

    const params: (string | number)[] = [];

    if (filters?.sessionType) {
      query += ` AND s.session_type = ?`;
      params.push(filters.sessionType);
    }

    if (filters?.startDate) {
      query += ` AND s.created_at >= ?`;
      params.push(filters.startDate);
    }

    if (filters?.endDate) {
      query += ` AND s.created_at <= ?`;
      params.push(filters.endDate);
    }

    query += `
      GROUP BY sf.flavor_id
      ORDER BY count DESC
    `;

    if (filters?.limit) {
      query += ` LIMIT ?`;
      params.push(filters.limit);
    }

    const result = await new Promise<FlavorFrequency[]>((resolve) => {
      db.transactionAsync(async tx => {
        const queryResult = await tx.executeSqlAsync(query, params);

        if (queryResult.rows && queryResult.rows.length > 0) {
          // Load flavor service to get flavor details
          const allFlavors = flavorService.getAllFlavors();

          const frequencies: FlavorFrequency[] = [];
          for (let i = 0; i < queryResult.rows.length; i++) {
            const row = queryResult.rows[i] as {
              flavorId: number;
              count: number;
              averageIntensity: number;
            };

            const flavor = allFlavors.find(f => f.id === row.flavorId);
            if (flavor) {
              frequencies.push({
                flavorId: row.flavorId,
                flavorName: flavor.name,
                category: flavor.category,
                count: row.count,
                averageIntensity: Math.round(row.averageIntensity * 10) / 10,
              });
            }
          }

          resolve(frequencies);
        } else {
          resolve([]);
        }
      }, false);
    });

    return result;
  }

  /**
   * Get uniformity scores for table cupping sessions.
   * Measures cup-to-cup consistency.
   *
   * @param sessionId - Session ID (must be table-cupping type)
   * @returns Uniformity scores for each coffee
   */
  async getUniformityScores(sessionId: string): Promise<UniformityScore[]> {
    const session = await sessionService.getSession(sessionId);
    if (!session || session.sessionType !== 'table-cupping') {
      return [];
    }

    const uniformityScores: UniformityScore[] = [];

    for (const coffee of session.coffees) {
      const cupScores = coffee.cups.map(cup => {
        const total =
          (cup.ratings.acidity || 0) +
          (cup.ratings.sweetness || 0) +
          (cup.ratings.body || 0) +
          (cup.ratings.clarity || 0) +
          (cup.ratings.finish || 0) +
          (cup.ratings.enjoyment || 0);

        return {
          cupId: cup.cupId,
          position: cup.position,
          totalScore: total,
        };
      });

      // Calculate standard deviation
      const scores = cupScores.map(cs => cs.totalScore);
      const mean = scores.reduce((sum, s) => sum + s, 0) / scores.length;
      const variance =
        scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length;
      const standardDeviation = Math.sqrt(variance);

      // Uniformity score: 100 - (std dev * 10), clamped to 0-100
      const uniformityScore = Math.max(0, Math.min(100, 100 - standardDeviation * 10));

      uniformityScores.push({
        coffeeId: coffee.coffeeId,
        coffeeName: coffee.name,
        uniformityScore: Math.round(uniformityScore * 10) / 10,
        cupScores,
        standardDeviation: Math.round(standardDeviation * 100) / 100,
      });
    }

    return uniformityScores;
  }

  /**
   * Compare two coffees in a multi-coffee session.
   *
   * @param sessionId - Session ID
   * @param coffeeId1 - First coffee ID
   * @param coffeeId2 - Second coffee ID
   * @returns Comparison data including score deltas and flavor overlap
   */
  async getCoffeeComparison(
    sessionId: string,
    coffeeId1: string,
    coffeeId2: string
  ): Promise<CoffeeComparison | null> {
    const session = await sessionService.getSession(sessionId);
    if (!session) return null;

    const coffee1 = session.coffees.find(c => c.coffeeId === coffeeId1);
    const coffee2 = session.coffees.find(c => c.coffeeId === coffeeId2);

    if (!coffee1 || !coffee2) return null;

    // Calculate averages for coffee 1
    const coffee1Scores = this.calculateAverageScores(coffee1.cups.map(c => c.ratings));
    const coffee1Flavors = this.getUniqueFlavors(coffee1.cups);

    // Calculate averages for coffee 2
    const coffee2Scores = this.calculateAverageScores(coffee2.cups.map(c => c.ratings));
    const coffee2Flavors = this.getUniqueFlavors(coffee2.cups);

    // Calculate deltas
    const scoreDelta = {
      acidity: coffee1Scores.acidity - coffee2Scores.acidity,
      sweetness: coffee1Scores.sweetness - coffee2Scores.sweetness,
      body: coffee1Scores.body - coffee2Scores.body,
      clarity: coffee1Scores.clarity - coffee2Scores.clarity,
      finish: coffee1Scores.finish - coffee2Scores.finish,
      enjoyment: (coffee1Scores.enjoyment || 0) - (coffee2Scores.enjoyment || 0),
      total:
        coffee1Scores.acidity +
        coffee1Scores.sweetness +
        coffee1Scores.body +
        coffee1Scores.clarity +
        coffee1Scores.finish +
        (coffee1Scores.enjoyment || 0) -
        (coffee2Scores.acidity +
          coffee2Scores.sweetness +
          coffee2Scores.body +
          coffee2Scores.clarity +
          coffee2Scores.finish +
          (coffee2Scores.enjoyment || 0)),
    };

    // Find shared and unique flavors
    const sharedFlavors = coffee1Flavors.filter(f => coffee2Flavors.includes(f));
    const uniqueToCoffee1 = coffee1Flavors.filter(f => !coffee2Flavors.includes(f));
    const uniqueToCoffee2 = coffee2Flavors.filter(f => !coffee1Flavors.includes(f));

    return {
      coffee1: {
        coffeeId: coffee1.coffeeId,
        name: coffee1.name,
        averageScores: coffee1Scores,
        totalScore:
          coffee1Scores.acidity +
          coffee1Scores.sweetness +
          coffee1Scores.body +
          coffee1Scores.clarity +
          coffee1Scores.finish +
          (coffee1Scores.enjoyment || 0),
        flavors: coffee1Flavors,
      },
      coffee2: {
        coffeeId: coffee2.coffeeId,
        name: coffee2.name,
        averageScores: coffee2Scores,
        totalScore:
          coffee2Scores.acidity +
          coffee2Scores.sweetness +
          coffee2Scores.body +
          coffee2Scores.clarity +
          coffee2Scores.finish +
          (coffee2Scores.enjoyment || 0),
        flavors: coffee2Flavors,
      },
      scoreDelta,
      sharedFlavors,
      uniqueToCoffee1,
      uniqueToCoffee2,
    };
  }

  // Helper methods

  private async getTopCategories(
    sessionId: string,
    limit: number
  ): Promise<Array<{ category: string; count: number }>> {
    const db = await getDatabase();

    const result = await new Promise<Array<{ category: string; count: number }>>(
      resolve => {
        db.transactionAsync(async tx => {
          const queryResult = await tx.executeSqlAsync(
            `SELECT
               COUNT(DISTINCT sf.flavor_id) as count
             FROM selected_flavors sf
             JOIN cups c ON sf.cup_id = c.id
             JOIN coffees co ON c.coffee_id = co.id
             WHERE co.session_id = ?
             ORDER BY count DESC
             LIMIT ?`,
            [sessionId, limit]
          );

          if (queryResult.rows && queryResult.rows.length > 0) {
            // Load flavors to get categories
            const session = await sessionService.getSession(sessionId);

            if (!session) {
              resolve([]);
              return;
            }

            // Collect all flavor IDs
            const flavorIds = new Set<number>();
            for (const coffee of session.coffees) {
              for (const cup of coffee.cups) {
                for (const flavor of cup.flavors) {
                  flavorIds.add(flavor.flavorId);
                }
              }
            }

            // Group by category
            const categoryCount = new Map<string, number>();
            const allFlavors = flavorService.getAllFlavors();

            for (const flavorId of flavorIds) {
              const flavor = allFlavors.find((f: { id: number }) => f.id === flavorId);
              if (flavor) {
                const count = categoryCount.get(flavor.category) || 0;
                categoryCount.set(flavor.category, count + 1);
              }
            }

            // Convert to array and sort
            const categories = Array.from(categoryCount.entries())
              .map(([category, count]) => ({ category, count }))
              .sort((a, b) => b.count - a.count)
              .slice(0, limit);

            resolve(categories);
          } else {
            resolve([]);
          }
        }, false);
      }
    );

    return result;
  }

  private calculateAverageScores(scores: StructuralScores[]): StructuralScores {
    if (scores.length === 0) {
      return {
        acidity: 3,
        sweetness: 3,
        body: 3,
        clarity: 3,
        finish: 3,
        enjoyment: 3,
      };
    }

    const totals = scores.reduce(
      (acc, s) => ({
        acidity: acc.acidity + (s.acidity || 0),
        sweetness: acc.sweetness + (s.sweetness || 0),
        body: acc.body + (s.body || 0),
        clarity: acc.clarity + (s.clarity || 0),
        finish: acc.finish + (s.finish || 0),
        enjoyment: acc.enjoyment + (s.enjoyment || 0),
      }),
      { acidity: 0, sweetness: 0, body: 0, clarity: 0, finish: 0, enjoyment: 0 }
    );

    return {
      acidity: Math.round((totals.acidity / scores.length) * 10) / 10 as 1 | 2 | 3 | 4 | 5,
      sweetness: Math.round((totals.sweetness / scores.length) * 10) / 10 as 1 | 2 | 3 | 4 | 5,
      body: Math.round((totals.body / scores.length) * 10) / 10 as 1 | 2 | 3 | 4 | 5,
      clarity: Math.round((totals.clarity / scores.length) * 10) / 10 as 1 | 2 | 3 | 4 | 5,
      finish: Math.round((totals.finish / scores.length) * 10) / 10 as 1 | 2 | 3 | 4 | 5,
      enjoyment: Math.round((totals.enjoyment / scores.length) * 10) / 10 as 1 | 2 | 3 | 4 | 5,
    };
  }

  private getUniqueFlavors(cups: Session['coffees'][0]['cups']): number[] {
    const flavorIds = new Set<number>();
    for (const cup of cups) {
      for (const flavor of cup.flavors) {
        flavorIds.add(flavor.flavorId);
      }
    }
    return Array.from(flavorIds);
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();
export default analyticsService;
