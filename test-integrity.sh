#!/bin/bash

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║       RapidRelief - COMPREHENSIVE INTEGRITY TEST REPORT        ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_WARNINGS=0

# ============ HELPER FUNCTIONS ============
test_pass() {
    echo -e "${GREEN}✓${NC} $1"
    ((TESTS_PASSED++))
}

test_fail() {
    echo -e "${RED}✗${NC} $1"
    ((TESTS_FAILED++))
}

test_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((TESTS_WARNINGS++))
}

# ============ SECTION 1: FILE INTEGRITY ============
echo "📁 SECTION 1: FILE STRUCTURE & INTEGRITY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check root files
[ -f "package.json" ] && test_pass "Root package.json exists" || test_fail "Root package.json missing"
[ -f "pnpm-lock.yaml" ] && test_pass "pnpm-lock.yaml exists" || test_warn "pnpm-lock.yaml missing (dependencies not locked)"

# Check backend
[ -f "backend/package.json" ] && test_pass "Backend package.json exists" || test_fail "Backend package.json missing"
[ -f "backend/.env" ] && test_pass "Backend .env file exists" || test_fail "Backend .env file missing (CRITICAL)"
[ -f "backend/server.js" ] && test_pass "Backend server.js exists" || test_fail "Backend server.js missing"
[ -f "backend/config/db.js" ] && test_pass "Database config exists" || test_fail "Database config missing"
[ -f "backend/models/Alert.js" ] && test_pass "Alert model exists" || test_fail "Alert model missing"
[ -f "backend/controllers/alertController.js" ] && test_pass "Alert controller exists" || test_fail "Alert controller missing"
[ -f "backend/routes/alertRoutes.js" ] && test_pass "Alert routes exist" || test_fail "Alert routes missing"
[ -f "backend/socket/socket.js" ] && test_pass "Socket configuration exists" || test_fail "Socket configuration missing"

# Check frontend
[ -f "frontend/package.json" ] && test_pass "Frontend package.json exists" || test_fail "Frontend package.json missing"
[ -f "frontend/tsconfig.json" ] && test_pass "Frontend tsconfig.json exists" || test_fail "Frontend tsconfig.json missing"
[ -f "frontend/next.config.mjs" ] && test_pass "Frontend next.config.mjs exists" || test_fail "Frontend next.config.mjs missing"
[ -f "frontend/app/page.tsx" ] && test_pass "Frontend main page exists" || test_fail "Frontend main page missing"
[ -f "frontend/app/layout.tsx" ] && test_pass "Frontend layout exists" || test_fail "Frontend layout missing"
[ -f "frontend/app/api/emergency-report/route.ts" ] && test_pass "Emergency report API route exists" || test_fail "Emergency report API route missing"

# Check AI service
[ -f "ai-service/main.py" ] && test_pass "AI service main.py exists" || test_fail "AI service main.py missing"
[ -f "ai-service/model.py" ] && test_pass "AI service model.py exists" || test_fail "AI service model.py missing"
[ -f "ai-service/requirements.txt" ] && test_pass "AI service requirements.txt exists" || test_fail "AI service requirements.txt missing"

echo ""

# ============ SECTION 2: CONFIGURATION VALIDATION ============
echo "⚙️  SECTION 2: CONFIGURATION VALIDATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check .env configuration
if [ -f "backend/.env" ]; then
    grep -q "MONGO_URI" backend/.env && test_pass "MONGO_URI configured" || test_fail "MONGO_URI not configured"
    grep -q "NODE_ENV" backend/.env && test_pass "NODE_ENV configured" || test_warn "NODE_ENV not configured"
else
    test_fail ".env file not found"
fi

# Check package.json scripts
grep -q "dev:frontend" package.json && test_pass "Frontend dev script exists" || test_warn "Frontend dev script missing"
grep -q "dev:backend" package.json && test_pass "Backend dev script exists" || test_warn "Backend dev script missing"
grep -q "dev:ai" package.json && test_pass "AI service dev script exists" || test_warn "AI service dev script missing"

# Check port configuration
grep -q "5000" backend/server.js && test_pass "Backend port configured (5000)" || test_warn "Backend port might not be set"
grep -q "8000" package.json && test_pass "AI service port configured (8000)" || test_fail "AI service port not correctly set"

echo ""

# ============ SECTION 3: DEPENDENCY VALIDATION ============
echo "📦 SECTION 3: DEPENDENCY VALIDATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Backend dependencies
[ -f "backend/package.json" ] && grep -q "express" backend/package.json && test_pass "Express is configured" || test_fail "Express missing from backend"
[ -f "backend/package.json" ] && grep -q "mongoose" backend/package.json && test_pass "Mongoose is configured" || test_fail "Mongoose missing from backend"
[ -f "backend/package.json" ] && grep -q "socket.io" backend/package.json && test_pass "Socket.io is configured" || test_fail "Socket.io missing from backend"
[ -f "backend/package.json" ] && grep -q "cors" backend/package.json && test_pass "CORS is configured" || test_fail "CORS missing from backend"

# Frontend dependencies
[ -f "frontend/package.json" ] && grep -q "next" frontend/package.json && test_pass "Next.js is configured" || test_fail "Next.js missing from frontend"
[ -f "frontend/package.json" ] && grep -q "react" frontend/package.json && test_pass "React is configured" || test_fail "React missing from frontend"

# AI service dependencies
[ -f "ai-service/requirements.txt" ] && grep -q "fastapi" ai-service/requirements.txt && test_pass "FastAPI is configured" || test_fail "FastAPI missing from AI service"
[ -f "ai-service/requirements.txt" ] && grep -q "uvicorn" ai-service/requirements.txt && test_pass "Uvicorn is configured" || test_fail "Uvicorn missing from AI service"

echo ""

# ============ SECTION 4: API ENDPOINTS VALIDATION ============
echo "🔗 SECTION 4: API ENDPOINTS VALIDATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Backend API endpoints
grep -q "router.post.*detect" backend/routes/alertRoutes.js && test_pass "POST /api/detect endpoint defined" || test_fail "POST /api/detect endpoint missing"
grep -q "router.get.*alerts" backend/routes/alertRoutes.js && test_pass "GET /api/alerts endpoint defined" || test_fail "GET /api/alerts endpoint missing"

# Frontend API endpoints
grep -q "emergency-report" frontend/app/api/emergency-report/route.ts && test_pass "Emergency report endpoint exists" || test_fail "Emergency report endpoint missing"

# AI service endpoints
grep -q "@app.get" ai-service/main.py && test_pass "AI home endpoint defined" || test_fail "AI home endpoint missing"
grep -q "@app.post.*analyze" ai-service/main.py && test_pass "AI analyze endpoint defined" || test_fail "AI analyze endpoint missing"

echo ""

# ============ SECTION 5: INTEGRATION POINTS ============
echo "🔌 SECTION 5: INTEGRATION POINTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Backend -> Database connection
grep -q "connectDB" backend/server.js && test_pass "Database connection initialized in server" || test_fail "Database connection not initialized"

# Backend -> Socket.io
grep -q "initSocket" backend/server.js && test_pass "Socket.io initialized in server" || test_fail "Socket.io not initialized"

# Backend -> AI Service
grep -q "axios.post.*analyze" backend/controllers/alertController.js && test_pass "Backend calls AI analyze endpoint" || test_fail "Backend doesn't call AI service"

# Frontend -> Backend API
grep -q "fetch.*api.*emergency-report" frontend/app/page.tsx && test_pass "Frontend calls emergency-report API" || test_fail "Frontend API call might be missing"

echo ""

# ============ SECTION 6: ERROR HANDLING ============
echo "🛡️  SECTION 6: ERROR HANDLING"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check error handling in key files
grep -q "try\|catch" backend/server.js && test_pass "Backend error handling present" || test_warn "Limited error handling in backend"
grep -q "try\|catch" backend/controllers/alertController.js && test_pass "Controller error handling present" || test_warn "Limited error handling in controller"
grep -q "try\|catch" frontend/app/page.tsx && test_pass "Frontend error handling present" || test_warn "Limited error handling in frontend"
grep -q "try\|catch\|except" ai-service/main.py && test_pass "AI service error handling present" || test_warn "Limited error handling in AI service"

echo ""

# ============ SECTION 7: SUMMARY ============
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                       TEST SUMMARY                             ║"
echo "╚════════════════════════════════════════════════════════════════╝"

echo ""
echo -e "✓ Tests Passed:  ${GREEN}${TESTS_PASSED}${NC}"
echo -e "✗ Tests Failed:  ${RED}${TESTS_FAILED}${NC}"
echo -e "⚠ Warnings:     ${YELLOW}${TESTS_WARNINGS}${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ All critical tests passed! Project integrity verified.${NC}"
    exit 0
else
    echo ""
    echo -e "${RED}✗ Critical issues found. Please review and fix the failed tests.${NC}"
    exit 1
fi
