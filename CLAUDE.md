# CLAUDE.md - AI Assistant Guide for Cupperv2

**Last Updated:** 2025-11-18
**Repository:** Cupping-app (Cupperv2)
**Status:** Initial Setup Phase

---

## Project Overview

Cupperv2 is a coffee cupping application designed to help coffee professionals evaluate and score coffee samples using standardized cupping protocols. This document serves as a comprehensive guide for AI assistants working on this codebase.

### Project Purpose
- Facilitate professional coffee cupping sessions
- Track and score coffee samples using industry-standard protocols (e.g., SCA scoring)
- Provide data analysis and reporting for cupping sessions
- Support collaborative cupping workflows

---

## Current Repository State

**Status:** Newly initialized repository
**Files Present:**
- `README.md` - Basic project identifier
- `.git/` - Git repository metadata
- `CLAUDE.md` - This file

**Next Steps:**
- Establish project structure and technology stack
- Set up development environment configuration
- Implement core cupping functionality

---

## Recommended Technology Stack

Based on the project name and common patterns for coffee cupping apps, consider:

### Frontend Options
- **React Native**: For cross-platform mobile app (iOS/Android)
- **React + TypeScript**: For web application
- **Next.js**: For full-stack web application with SSR

### Backend Options
- **Node.js + Express**: Lightweight API server
- **Next.js API Routes**: Integrated backend for web app
- **Firebase/Supabase**: Backend-as-a-service for rapid development

### Database
- **PostgreSQL**: Robust relational database for structured cupping data
- **SQLite**: For local-first mobile applications
- **MongoDB**: For flexible schema if needed

### Key Libraries (Suggested)
- **Form Management**: React Hook Form or Formik
- **State Management**: Zustand, Redux Toolkit, or React Query
- **Data Visualization**: Chart.js, Recharts, or D3.js
- **Authentication**: NextAuth.js, Firebase Auth, or Auth0

---

## Development Conventions

### Code Style

#### General Guidelines
- Use **TypeScript** for type safety
- Follow **ESLint** and **Prettier** configurations
- Use **functional components** and React Hooks
- Implement **proper error handling** throughout

#### Naming Conventions
```typescript
// Components: PascalCase
ComponentName.tsx

// Hooks: camelCase with 'use' prefix
useCustomHook.ts

// Utilities: camelCase
formatCuppingScore.ts

// Constants: SCREAMING_SNAKE_CASE
MAX_CUPPING_SCORE = 100

// Types/Interfaces: PascalCase
interface CuppingSession { }
type ScoreCategory = "aroma" | "flavor" | "aftertaste"
```

#### File Structure (Recommended)
```
/src
  /components
    /cupping
      CuppingForm.tsx
      ScoreCard.tsx
    /common
      Button.tsx
      Modal.tsx
  /hooks
    useCuppingSession.ts
    useScoreCalculation.ts
  /services
    api.ts
    storage.ts
  /types
    cupping.types.ts
    user.types.ts
  /utils
    scoreCalculations.ts
    dateFormatters.ts
  /contexts
    AuthContext.tsx
    CuppingContext.tsx
  /pages or /app
    index.tsx
    sessions/[id].tsx
```

### Git Workflow

#### Branch Naming
- `feature/` - New features (e.g., `feature/add-cupping-form`)
- `fix/` - Bug fixes (e.g., `fix/score-calculation-bug`)
- `refactor/` - Code refactoring (e.g., `refactor/api-layer`)
- `docs/` - Documentation updates (e.g., `docs/update-readme`)
- `claude/` - AI assistant branches (auto-generated)

#### Commit Messages
Follow conventional commits:
```
feat: add cupping session creation form
fix: correct aroma score calculation
refactor: reorganize component structure
docs: update API documentation
test: add unit tests for score calculations
```

#### Pull Request Guidelines
- Provide clear description of changes
- Link related issues
- Include test coverage
- Update documentation as needed

---

## Domain-Specific Knowledge

### Coffee Cupping Concepts

#### SCA Cupping Protocol
The Specialty Coffee Association (SCA) protocol includes:

**Scoring Categories (0-10 scale each):**
1. **Fragrance/Aroma** - Dry and wet aroma evaluation
2. **Flavor** - Overall flavor impression
3. **Aftertaste** - Length and quality of finish
4. **Acidity** - Intensity and quality
5. **Body** - Tactile feeling in the mouth
6. **Balance** - How well components work together
7. **Uniformity** - Consistency across cups (5 cups, 2 points each)
8. **Clean Cup** - Lack of defects (5 cups, 2 points each)
9. **Sweetness** - Presence of sweetness (5 cups, 2 points each)
10. **Overall** - Cupper's overall assessment

**Final Score Calculation:**
- Sum of all categories + Defects (negative points)
- Scale: 0-100 points
- Quality levels:
  - 90-100: Outstanding
  - 85-89.99: Excellent
  - 80-84.99: Very Good
  - <80: Below Specialty Grade

#### Key Data Models

```typescript
// Example data structures for reference

interface CuppingSession {
  id: string;
  date: Date;
  cupper: User;
  samples: CoffeeSample[];
  completed: boolean;
  notes?: string;
}

interface CoffeeSample {
  id: string;
  sampleNumber: string;
  roastDate?: Date;
  origin?: string;
  variety?: string;
  process?: string;
  scores: CuppingScores;
  defects: Defect[];
  totalScore: number;
}

interface CuppingScores {
  fragrance: number; // 0-10
  flavor: number;    // 0-10
  aftertaste: number; // 0-10
  acidity: number;    // 0-10
  body: number;       // 0-10
  balance: number;    // 0-10
  uniformity: number; // 0-10 (usually 2pts per cup)
  cleanCup: number;   // 0-10 (usually 2pts per cup)
  sweetness: number;  // 0-10 (usually 2pts per cup)
  overall: number;    // 0-10
}

interface Defect {
  type: 'taint' | 'fault';
  intensity: number; // 2 or 4
  cups: number;      // number of affected cups
}
```

---

## Testing Strategy

### Unit Tests
- Test all score calculation logic
- Validate data transformations
- Test utility functions
- **Framework:** Jest + React Testing Library

### Integration Tests
- Test API endpoints
- Test database operations
- Test authentication flows
- **Framework:** Jest + Supertest

### E2E Tests
- Test complete cupping workflows
- Test form submissions
- Test data persistence
- **Framework:** Cypress or Playwright

### Test Coverage Goals
- Minimum 80% coverage for core business logic
- 100% coverage for score calculations
- Critical user paths fully tested

---

## Security Considerations

### Data Protection
- Sanitize all user inputs
- Implement proper authentication and authorization
- Use environment variables for secrets
- Never commit API keys or credentials

### Common Vulnerabilities to Avoid
- **XSS**: Sanitize rendered user content
- **SQL Injection**: Use parameterized queries
- **CSRF**: Implement CSRF tokens for forms
- **Auth Issues**: Validate JWT tokens properly

### Secure Score Integrity
- Validate score ranges (0-10, 0-100)
- Prevent score manipulation on client side
- Audit trail for score modifications
- Implement proper access controls

---

## Performance Best Practices

### Frontend Optimization
- Lazy load components and routes
- Implement virtual scrolling for large lists
- Optimize images and assets
- Use React.memo for expensive components
- Debounce form inputs

### Backend Optimization
- Index database columns appropriately
- Implement caching for frequent queries
- Paginate large datasets
- Use database connection pooling
- Optimize N+1 queries

### Mobile Considerations
- Minimize bundle size
- Implement offline functionality
- Optimize for slow networks
- Use progressive enhancement

---

## AI Assistant Guidelines

### When Working on This Project

#### 1. Understanding Context
Before making changes:
- Read relevant source files thoroughly
- Understand the cupping domain terminology
- Review existing patterns and conventions
- Check for related tests

#### 2. Making Changes
- **Always use TypeScript** with proper types
- **Write tests** for new functionality
- **Update documentation** when adding features
- **Follow existing patterns** in the codebase
- **Consider mobile/offline use cases** if applicable

#### 3. Score Calculations
- Verify score ranges are correct
- Ensure proper defect deductions
- Test edge cases (empty scores, invalid inputs)
- Maintain precision (typically 0.25 increments)

#### 4. Data Integrity
- Validate all cupping data
- Ensure referential integrity
- Handle data migrations carefully
- Back up data before destructive operations

#### 5. User Experience
- Cupping forms should be intuitive
- Support keyboard navigation
- Provide clear error messages
- Implement auto-save where appropriate
- Consider offline scenarios

#### 6. Code Review Checklist
Before committing:
- [ ] Code follows TypeScript best practices
- [ ] Tests are written and passing
- [ ] Documentation is updated
- [ ] No security vulnerabilities introduced
- [ ] Performance considerations addressed
- [ ] Accessibility requirements met
- [ ] Score calculations are accurate
- [ ] Error handling is comprehensive

---

## Common Tasks

### Adding a New Cupping Category
1. Update `CuppingScores` interface in types
2. Add input field to cupping form
3. Update score calculation logic
4. Add validation rules
5. Update database schema/migrations
6. Add tests for new category
7. Update documentation

### Implementing New Report Type
1. Define report data structure
2. Create data aggregation logic
3. Implement visualization component
4. Add export functionality (PDF/Excel)
5. Write tests
6. Update user documentation

### Adding User Authentication
1. Choose auth provider
2. Implement auth context
3. Add protected routes
4. Implement login/logout flows
5. Add user profile management
6. Test security measures

---

## Dependencies Management

### Package Updates
- Review breaking changes before updating
- Test thoroughly after major version updates
- Keep security patches current
- Document version requirements

### Adding New Dependencies
- Evaluate necessity
- Check bundle size impact
- Verify license compatibility
- Consider alternatives
- Document why it's needed

---

## Deployment

### Environment Variables
```bash
# Example .env structure (to be created)
DATABASE_URL=
API_KEY=
JWT_SECRET=
NODE_ENV=development|production
```

### Build Process
```bash
# To be established based on chosen stack
npm run build
npm run test
npm run lint
```

### Deployment Checklist
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Security headers configured
- [ ] Error tracking enabled
- [ ] Analytics implemented (if needed)
- [ ] Backup strategy in place

---

## Resources

### Coffee Cupping
- [SCA Cupping Protocols](https://sca.coffee/research/protocols-best-practices)
- [SCA Cupping Form](https://sca.coffee/research/cupping-protocols)
- Coffee Quality Institute (CQI) Q Grader standards

### Development
- Project-specific documentation (to be added)
- API documentation (to be added)
- Architecture decision records (to be added)

---

## Troubleshooting

### Common Issues

#### Score Calculation Errors
- Verify all score categories are within valid ranges
- Check defect calculations (defects reduce score)
- Ensure proper decimal handling

#### Data Persistence Issues
- Check database connection
- Verify schema migrations are current
- Validate data types match schema

#### Authentication Problems
- Verify environment variables are set
- Check token expiration handling
- Validate JWT signature

---

## Future Considerations

### Potential Features
- Multi-language support
- Collaborative cupping sessions
- Advanced analytics and reporting
- Integration with coffee supply chain systems
- Mobile offline sync
- Bluetooth scale integration
- Photo/video capture for samples
- Aroma wheel integration
- Comparison tools across sessions

### Scalability
- Consider microservices architecture if app grows
- Plan for multi-tenant support
- Database sharding strategy
- CDN for global distribution

---

## Questions for Project Owner

When an AI assistant needs clarification:

1. **Technology Stack**: What specific technologies should be used?
2. **Platform**: Web, mobile (iOS/Android), or both?
3. **User Base**: Professional cuppers, roasters, or consumers?
4. **Deployment**: Cloud platform preference (AWS, GCP, Vercel, etc.)?
5. **Authentication**: User management requirements?
6. **Offline Support**: Is offline functionality critical?
7. **Collaboration**: Will multiple cuppers work on same session?
8. **Integration**: Any existing systems to integrate with?

---

## Version History

### 2025-11-18 - Initial Creation
- Established CLAUDE.md structure
- Defined conventions and guidelines
- Added cupping domain knowledge
- Created comprehensive AI assistant guide

---

## Contact & Support

- Repository: Cupping-app
- Issues: Use GitHub issue tracker
- Documentation: This file and project README

---

**Note to AI Assistants:** This document will evolve as the project develops. Always check the "Last Updated" date and supplement this information with current codebase analysis. When in doubt, ask the user for clarification on project-specific requirements.
